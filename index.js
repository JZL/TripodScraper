const puppeteer = require('puppeteer');
const fs = require("fs");

/* NOTE: 
 * Sometimes if an await fails, it hangs because the browser is still
 * open. I tried to stop this but, if you're using cron, **USE `timeout` TO
 * MAKE SURE EXITS.** You don't want cron jobs hanging silently
 */

//Needs to be in global namespace so can be used in try catch namespace
let creds;
let browser, page;
try{
    creds = require('./creds');
    console.log(creds)
}catch(e){
    console.log("Need tripod credentials. Check creds.js.example")
    return 1;
}
//debug mode, headless shows chrome and saves screenshots
const headless = true;
const screenshot = false;






//So screenshots are sequentially added
let screenShotIndex = 0;

async function run(){
    try{
        browser = await puppeteer.launch({
            headless: headless,
            //https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md
            //Not recommended b/ Paul Irish does it so...
            //args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        page = await browser.newPage();

        await page.goto('https://tripodclassic.brynmawr.edu/patroninfo/');

        await page.type("#name", creds.name);
        await page.type("#code", creds.code);
        await screenShot(page);

        //Annoying xpath for the submit button
        await page.click("#pverifyWeb > form > table > tbody > tr:nth-child(6) > td > div > a")
        console.log("clicked")

        await page.waitFor(".patNameAddress", {timeout: 30000});
        console.log("(1) Got past login");
        await screenShot(page);

        await page.click("#patButChkouts>a")
        console.log("clicked")
        
        await page.waitFor(".patFuncTitle", {timeout: 30000});
        console.log("(2) Got to loans");
        await screenShot(page);

        pageRet = await page.evaluate(function (){
            //need pressSubmit? because can be overdue but already have 2
            //renewals so can't do anything about it

            var ret = [false, ""] //[pressSubmit?, output str]
            var rows = document.querySelectorAll("#patfunc_main>tbody>tr.patFuncEntry")
            var todayT = (new Date()).setHours(0,0,0,0)
            //Set reminder day for 3 days ago
            var daysAgo = new Date(todayT)
            daysAgo.setDate(daysAgo.getDate() + 3)

            for(var i = 0; i<rows.length;i++){
                //dayString
                var dS = rows[i].children[3].childNodes[0].wholeText.replace(" DUE ", "").replace(/\s*$/, "").split("-")
                var d = new Date("20"+dS[2], parseInt(dS[0])-1, dS[1])
                if(d.getTime() <= daysAgo.getTime()){
                    ret[1]+=rows[i].children[1].innerText.replace(/\s*$/, "")+" needs to be renewed"+"\n";

                    if(d.getTime() == todayT){
                        ret[1]+="    Due Today!"+"\n";
                    }else if(d.getTime() <= todayT){
                        ret[1]+="    OVERDUE"+"\n";
                    }

                    if(rows[i].children[3].children.length >=1 && rows[i].children[3].children[0].innerText == "Renewed 2 times"){
                        ret[1]+="    CAN'T BE RENEWED, TOO MANY RENEWALS"+"\n";
                    }else{
                        rows[i].children[0].children[0].click()
                        ret[0] = true;
                        ret[1]+="    Renewing...Nice"+"\n";
                    }
                }
            }
            return ret;
            //submitCheckout( 'requestRenewSome', 'requestRenewSome'  )
        })


        console.log("=================")
        console.log("Pressing renew? "+pageRet[0])
        console.log("-----------------")
        console.log(pageRet[1]);
        console.log("=================")

        await screenShot(page);

        if(pageRet[0] == false){
            //Nothing to do
            console.log("No books can be renewed")
            if(pageRet[1] == ""){
                 pageRet[1] = "!!Nothing To Do!!";
            }
        }else{
            //Click Renew Marked buttonk
            //await page.click("#checkout_form > a:nth-child(5)");
            await page.evaluate(function (){
                submitCheckout( 'requestRenewSome', 'requestRenewSome'  )
            });
            console.log("Sumbitted checkout")
            await screenShot(page);
            console.log("done screenshot")
            await page.waitFor(".confirmationprompt", {timeout: 30000});
            console.log("(3) Got past sumbitting checkout")

            //Click the Yes button for proceeding
            //await page.click("#checkout_form > a:nth-child(3)");
            console.log("Sumbitted checkout")
            await page.evaluate(function (){
                submitCheckout( 'renewsome', 'renewsome')
            });
            await page.waitFor(".patFuncTitle", {timeout: 30000});
            console.log("(4) Got back to loans");
        }

        if(headless){
            await page.close();
            await browser.close();
        }
        console.log("done");


        fs.writeFile("cron.output", pageRet[1], "utf8", function(err){
            if(err){
                console.log("Error writing file");
                console.log(err)
            }
        })
    }catch(e){
        console.log("bigE: "+e)
        try{
            await page.close();
            await browser.close();
        }catch(littleE){
            console.log(littleE)
            console.log("Can't even close page/browser on error...Force exiting")
            process.exit(1);
        }
        return await new Error(e);
    }
};

async function throws(e){
    await page.close();
    await browser.close();
    throw new Error(e)
}
async function screenShot(page){
    if(screenshot){
        screenShotIndex++;
        console.log("screenShotting: "+screenShotIndex);
        return page.screenshot({path: (screenShotIndex)+".png", fullPage: true});
    }else{
        //Doesn't do anything b needs to return
        return false;
    }
}
run().catch(function (e){
    if(e){
        console.log(e)
    }
})
