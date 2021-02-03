//the array i'm using for reports and switches:
let coinsSymbol;

//the name of the interval of the reports that needed to end after changing the web display:
var myReportsInterval;

//the array I need for the "more info" buttons
let temporary;

//the boolean that telling me if the coins chosen are more than 5:
let isMoreThanFive = false;

//the variable the progress bar is using to start it's percentage:
let myBarPercent = 0;

//the array I need for the "latest-interest" div
let latest;

// localStorage.clear();

// **********************************************************************************************//
// **********-----initiate all the local storage , also the starting function-----*************//
const coinsInit = async () => {
    try {
        //clearing the interval for the reports:
        clearInterval(myReportsInterval);
        //making the progress bar visible:
        animateProgressBar();
        //getting the "GET" from ajax and storing it: 
        const coins = await getMyThings("https://api.coingecko.com/api/v3/coins/","");
        localStorage.setItem("coins", JSON.stringify(coins));
        //calling the function that creating the main div:
        allCountriesCoins(coins);
        //making the pagination - the home would be with "active" bootstrap-class
        activating("home");

    } catch (error) {
        console.log("oh no! problem with making the default function", error);
    }
}

// **********************************************************************************************//
// *****************************----------get all the ajax----------****************************//
const getMyThings = (url,continueUrl)=>{
    return($.ajax({
        //first key of the ajax is xhr:
        xhr: function()
        {
        //xhr is a function that ask for the progress of the request:
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                //this is a variable that indicate the percentages of the progress
                myBarPercent = (Math.round(percentComplete));
                //while it's loading it keeps calling this function that changing the progress bar:
                circleProgressBar();
            }
        }, false);    
        xhr.addEventListener("progress", function(evt){
            if (evt.lengthComputable) {
                myBarPercent = evt.loaded / evt.total;
            }else{
                //this is a variable that indicate the percentages of the progress
                myBarPercent = (Math.round(evt.loaded / 9070.18));
            }    
            //while it's loading it keeps calling this function that changing the progress bar:
            circleProgressBar();
            
        }, false);

        return xhr;
        },
        //second key of the ajax is type:
        type: 'GET',

        //third key of the ajax is url:
        url: `${url}${continueUrl}`,

        //fourth key of the ajax is success:
        success: ()=>{
            myBarPercent=100;
            //calling the function that create the progress bar one last time:
            circleProgressBar ();

            //making sure the progress bar would not appear in the graph chart each request:
            if(url.indexOf("pricemulti?fsyms=")===-1){
                setTimeout(() => { $(".my-content-progress").css({visibility:"hidden"})},1500)

                $(".my-content-progress").css({opacity: 1.0}).animate(
                    {opacity: 0.0},
                    {duration: 1500});              
            }
        },
    }));
}

// **********************************************************************************************//
// ***************************-----create the main or the modal-----****************************//
const allCountriesCoins = (myCoinsContent) => {
    try {
        //changing the place to build the coins; either on the modal or div that called "my-content"
        let divContent;
        if(isMoreThanFive===true){
            divContent = document.querySelector(".my-model-body");
            isMoreThanFive = false;

        }else{
        divContent = document.querySelector(".my-content");
        }

        divContent.innerHTML = "";
        if(myCoinsContent.length ===0) throw "There are no coins available with the criteria you asked for"
        //doing a loop for all coins
        for (let i = 0; i < myCoinsContent.length; i++) {
            //this three variables have alot of numbers after the dot, so i'm cutting it short:
            let myRoundUsd = parseFloat(myCoinsContent[i].market_data.current_price.usd.toFixed(3));
            let myRoundEur = parseFloat(myCoinsContent[i].market_data.current_price.eur.toFixed(3));
            let myRoundIls = parseFloat(myCoinsContent[i].market_data.current_price.ils.toFixed(3));

            let myCoin = document.createElement("div");
            divContent.appendChild(myCoin);
            myCoin.classList.add("col","coin-div");
            myCoin.id = `my-coin-${myCoinsContent[i].symbol}`
            myCoin.innerHTML = `
            <div class="card col-xs the-card-coin">
                <div class="col coin-div-top">
                    <div class="form-check form-switch coin-toggle">
                        <label class="form-check-label coin-symbol"
                            for="theSwitch">${myCoinsContent[i].symbol}</label>
                        <input name="${myCoinsContent[i].symbol}" type="checkbox" id="theSwitch"
                            class="form-check-input coin-toggle-switch my-${myCoinsContent[i].symbol}">
                    </div>
                    <p class="coin-name">${myCoinsContent[i].id.split("-").join(" ")}</p>
                    <button onclick="tempInfo(${myCoinsContent[i].symbol})" id="${myCoinsContent[i].symbol}"
                        class ="btn btn-primary coin-info" aria-expanded="false" type="button"
                        data-bs-toggle="collapse" data-bs-target="#my-${myCoinsContent[i].symbol}" 
                        aria-controls="my-${myCoinsContent[i].symbol}">
                        More Info
                    </button>
                </div>
                <div class="collapse my-collapse" id="my-${myCoinsContent[i].symbol}">
                    <div class="card card-body my-collapse-card">
                        <img src="${myCoinsContent[i].image.small}"
                            alt="${myCoinsContent[i].id} image">
                        <p>USD Value:<strong>${myRoundUsd}$</strong></p>
                        <p>EUR Value:<strong>${myRoundEur}€</strong></p>
                        <p>ILS Value:<strong>${myRoundIls}₪</strong></p>
                    </div>
                </div>
            </div>
            `
            //all switch with this class has two elements; one that is on the div that called
            //"my-content" and the other is on the modal:
            let mySwitch = document.querySelectorAll(`.my-${myCoinsContent[i].symbol}`);
            
            mySwitch.forEach(mySwitches=> mySwitches.onchange = (e) => activateToggle(e.target,myCoinsContent[i]));        
        }
        //after the home page loaded, I need to toggle the switches that was saved as checked: 
        makingItChecked();

    } catch (error) {
        //if your search has no value to display:
        errorWithCoin(error);
    }
}

// ********************************************************************************************//
// ******-----making all the coins that was save in the localStorage to be checked-----*******//
const makingItChecked = () => { 
    try{
        for(let i=0;i<coinsSymbol.length;i++){

            let mySwitch = document.querySelectorAll(`.my-${coinsSymbol[i].symbol}`);
            if(mySwitch !== null){
                mySwitch.forEach(mySwitches=>mySwitches.checked = true)
            }            
        }
    }catch(error){
        console.log("oh no! problem with making the toggle checked", error);
    }        
}

// *************************************************************************************************//
// ***************************-----presenting an error on screen-----******************************//
const errorWithCoin = (error)=>{
    let divContent = document.querySelector(".my-content");
    divContent.innerHTML = "";
    let myCoin = document.createElement("div");
    divContent.appendChild(myCoin);
    myCoin.className = "row row-cols-1 row-cols-md-3 g-4 coin-div-error";
    myCoin.id = `my-coin-error`
    myCoin.innerHTML = `
        <h3 class="nothing-on-search">${error}</h3>`
}

// *************************************************************************************************//
// ********************-----changing the content of the collapse element-----**********************//
const changeMoreInfo = async(coin)=>{
    //after the timeout is finished the progressBar needed to be executed 
    animateProgressBar();
    //after the timeout is finished the call to get needed to be executed 
    const thisOneCoin = await getMyThings("https://api.coingecko.com/api/v3/coins/",coin.id);
    
    //if they finished waiting for 2 minutes they would be removed 
    temporary.splice((temporary.indexOf(coin)),1);
    //after the info has been updating the sessionStorage need to remove the coin
    sessionStorage.setItem("temporary", JSON.stringify(temporary));  
    //changing the three dot after the long numbers:
    let myRoundUsd = parseFloat(thisOneCoin.market_data.current_price.usd.toFixed(3));
    let myRoundEur = parseFloat(thisOneCoin.market_data.current_price.eur.toFixed(3));
    let myRoundIls = parseFloat(thisOneCoin.market_data.current_price.ils.toFixed(3));
    //selecting the first element before the <p> that has indicator:
    let myCollapseDiv = document.querySelector(`#my-${thisOneCoin.symbol}`).children;
    let myCollapseDivChildren = myCollapseDiv[0].children;
    //changing the content of every p element:
    myCollapseDivChildren[0].src = `${thisOneCoin.image.small}`;
    myCollapseDivChildren[1].innerHTML = `USD Value: <strong>${myRoundUsd}$</strong>`;
    myCollapseDivChildren[2].innerHTML = `EUR Value: <strong>${myRoundEur}€</strong>`;
    myCollapseDivChildren[3].innerHTML = `ILS Value: <strong>${myRoundIls}₪</strong>`;
}

// **********************************************************************************************//
// *********************-----activate when one of the switch is used-----***********************//
const activateToggle = (mySwitch,coinObj) => {
    try{
        if (mySwitch.checked === true) {   //if it turn the switch on
        
            if (coinsSymbol.length < 5) {   //if it's less than five it means its good                
                mySwitch.checked = true;
                coinsSymbol.push(coinObj);

            } else if(coinsSymbol.length === 5){
                //if it's 5 it's not good 'cause the condition comes before the coinsSymbol.push
                //therefore if it's 5 it means the user just toggled-on the 6th
                openModal(coinsSymbol);
                coinsSymbol.push(coinObj);
                mySwitch.checked = true;
            }
            //only when toggled-on it will call this function that will update your interests:
            yourLatestUpdate(coinObj,"Toggled-On");

        } else {      //if it turn the switch off
        
            mySwitch.checked = false;
            
            for (let i = 0; i < coinsSymbol.length; i++) {      //remove from array coinsSymbol
                if (coinsSymbol[i].symbol === mySwitch.name) {
                    coinsSymbol.splice(i, 1);
                }
            }
            if(coinsSymbol.length===5){
                //if after we splice the array: coinsSymbol and it's length = 5,
                //it means that before the splice it's length was 6 therefore it was opened
                //by modal, and so the modal needs to be closed
                jQuery('.my-modal-main').modal('hide');
                var theOtherSwitch = document.querySelectorAll(`.my-${mySwitch.name}`);
                theOtherSwitch[0].checked = false;
            }
        }

        localStorage.setItem("limitFive", JSON.stringify(coinsSymbol));

    }catch(error){
        console.log("oh no! problem with making the switch", error);
    }
}

// *****************************************************************************************************//
// *********-----it's opening the modal;activate after yourFiveCoinsLimit is activated-----************//
const openModal = (searchOfCoinsArray)=>{
    isMoreThanFive = true;
    jQuery('.my-modal-main').modal('show');
    const theCoin = allCountriesCoins(searchOfCoinsArray);
};

// *************************************************************************************//
// ********************-----it's doing the search for you coins-----*******************//
const searchCoins = async() => {
    try {
        const inputSearch = document.querySelector(".input-search").value.toLowerCase();
        let searchOfCoinsArray = [];
        const thisSearchedCoin = await getMyThings("https://api.coingecko.com/api/v3/coins/",inputSearch);
        if(thisSearchedCoin===undefined) throw ""
        if(typeof thisSearchedCoin ==='object'){
            searchOfCoinsArray.push(thisSearchedCoin);
        }else{
            searchOfCoinsArray = thisSearchedCoin;
        }        
        allCountriesCoins(searchOfCoinsArray);

    } catch (error) {
        errorWithCoin("Sorry, there are no coins with those criteria")
    }
}


// ********************************************************************************************************//
// *************-----it's creating the timeout for the collapsing area that was chosen-----***************//
const tempInfo = (button) => {
    try{
        let checking = false;
        let coins = JSON.parse(localStorage.getItem("coins"));
        let theCoin = coins.find(coin=> coin.symbol===button.id);
        //would check if this specific More-Info button was pushed and it's inside the temporary array
        temporary.forEach(coin=>{
            if(coin.symbol ===button.id){
                checking = true;
                var now = new Date().getTime();
                if(now-coin.time >= 10000){
                    //in order to change the information in the collapse, I need the whole coin Info,
                    //I can get it from the "GET" i just did
                    changeMoreInfo(coin);
                }
            }
        });
        //would only call the tempSetTimeout() when it is yet to be inside the temporary array
        //when the More-Info button was pushed it will call yourLatestUpdate() that will update your interests        
        if(checking ===false){
            var now = new Date().getTime();
            temporary.push({
                id: theCoin.id, 
                symbol: button.id, 
                time: now
            });                  
            sessionStorage.setItem("temporary", JSON.stringify(temporary));
            // tempSetTimeout(temporary.find(coin=> coin.time===now));
            yourLatestUpdate(theCoin,"More-Info");
        }

    } catch (error) {
        console.log("oh no! problem with clearing/adding the More-Info Buttons to temporary Storage", error);
    }
}

// *************************************************************************************//
// ***********************-----clearing all switches-----******************************//
const mySwitchClear= ()=>{
    try{
        let mySwitch = document.querySelectorAll(".coin-toggle-switch");
        mySwitch.forEach(coin=>coin.checked = false);

        coinsSymbol = [];
        localStorage.setItem("limitFive", JSON.stringify(coinsSymbol));

    } catch (error) {
        console.log("oh no! problem with clearing the switches", error);
    }
}

// ******************************************************************************************//
// ********************-----creating the graph with the reports-----************************//
const reportsLive = async () => {
    try {
        clearInterval(myReportsInterval);
        activating("reports");
        const divContent = document.querySelector(".my-content");
        divContent.innerHTML = "";
        divContent.innerHTML = `<div id="chartContainer" class="my-chart-report"></div>`;

        //this is the graph template,where the whole chart is built
        var options = {
            animationEnabled: true,
            title: {text: `Coins Value Over Time`},
            subtitles: [{text: ``}],
            axisX: {
                title: "Real Time (in sec)",
                titleFontColor: "#C0504E",
		        lineColor: "#C0504E",
        		labelFontColor: "#C0504E",
		        tickColor: "#C0504E"
            },
            axisY: {
                title: "Coin Value (in USD $)",
                titleFontColor: "#4F81BC",
                lineColor: "#4F81BC",
                labelFontColor: "#4F81BC",
                tickColor: "#4F81BC"
            },
            toolTip: {shared: true},
            legend: {
                //this makes the legend dynamic, 
                //using the "toggleDataSeries" that is a few line after:
                cursor: "pointer",
                itemclick: toggleDataSeries
            },
            //this is the graph data where the graph for each coins is build:
            data: []
        };
        var chart = new CanvasJS.Chart("chartContainer", options);

        if(coinsSymbol.length ===0) throw "Sorry, you need to choose coins for this function"
        //this is how I insert the info for each coin:
        for (let i = 0; i < coinsSymbol.length; i++) {
            options.data.push({
                type: "spline",
                name: `${coinsSymbol[i].symbol.toUpperCase()}`,
                showInLegend: true,
                dataPoints: []
            });
            options.subtitles[0].text +=`${coinsSymbol[i].symbol.toUpperCase()}, `;
        }
        let theSlice = options.subtitles[0].text.slice(0, -2);
        options.subtitles[0].text = theSlice

        //this function been called every 2 sec, asking for the info by the "GET" method
        const updateChart = async () => {
            //the "mySelectedCoins" is getting the info, "listOfCoins()" building the url: 
            let mySelectedCoins = await listOfCoins();

            //"coinsValues" is creating [] to just the values of the info,
            //this info will be the y value: 
            let coinsObj = Object.values(mySelectedCoins);
            let coinsValues = [];
            coinsObj.forEach(coin=> coinsValues.push(coin.USD));

            //is creating the current time for x values: 
            let myTime = new Date().toLocaleTimeString();

            //this for loop is pushing the info for each coin. for both x, y values: 
            for (let i = 0; i <coinsValues.length; i++) {
                if(options.data[i]===undefined) {
                    errorWithCoin("Sorry, you need to choose coins for this function")
                }
                let myCoin = options.data[i].dataPoints;
                myCoin.push({y: coinsValues[i],label: myTime});
            }
            //making sure the info will show on screen:
            chart.render();
        }

        //this function is creating the legend,
        //from witch you could remove or add the graph for each coin
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
        //making sure the info will show on screen:
        chart.render();
        //the interval:
        myReportsInterval = setInterval(() => updateChart(), 2000);

    } catch (error) {
        //if you didn't toggled-on any coins:
        errorWithCoin (error);
    }
}

// *********************************************************************************************//
// *********************-----create the url for all the coins chosen-----**********************//
const listOfCoins = async () => {
    try {
        let theRestUrl = coinsSymbol.map(coin=> coin.symbol);
        const mySelectedCoins = await getMyThings(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${theRestUrl}&tsyms=USD`,"");
        return mySelectedCoins;

    } catch (error) {
        console.log("oh no! problem with making the list", error)
    }
}

// ***********************************************************************************************//
// *****************-----changing the main div to creating the about div-----********************//
const myAbout = (whatIsIt)=>{
    try{
        clearInterval(myReportsInterval);
        activating("about");
        let divContent = document.querySelector(".my-content");
        divContent.innerHTML = ``;
        let myCoin = document.createElement("div");
        divContent.appendChild(myCoin);
        myCoin.className = "about-div";
        
        myCoin.innerHTML = `
        <div class="about-main">
            <div class="about-web">
                <h2 class="description">Web Description</h2>
                <div>
                <p class="all-the-words">
                This site displays a selected amount of coins, allows access to all information about them and shows reports in real time.<br><br>
                The purpose of creating this site is practical learning as part of the "Full Stack Web Developers" course of the training college "John Bryce", appling the variety of tools acquired during the course so far.<br><br>
                The project was allocated a month to do.<br><br>
                The success of the project is the assimilation of the material studied and the construction of correct applied thinking for future projects.<br>
                The site will be for client side only and contains various API calls.<br><br>
                The following topics were implemented in this project:<br><br>
                ▪ HTML + CSS: New HTML5 tags, CSS3 media queries and advanced selectors, Dynamic page layouts
                Bootstrap & flex.<br><br>
                ▪ JavaScript:Objects, Callbacks, Promises, Async Await, jQuery, Single Page Application foundations, Events, Ajax (RESTful API), Documentation<br>
                ▪ External APIs
                </p>
                </div>
            </div>
        </div>         
        <div class="about-buttons">
            <div class="button-location">
                <button class="web-button-about" onclick="myAbout('web')">Web</button>
                <button class="me-button-about"onclick="myAbout('me')">Me</button>
            </div>
        </div>                  
        `
        if(whatIsIt==="me"){
            let mainAbout = document.querySelector(".about-main");
            mainAbout.innerHTML = `
            <div class="my-pictures">
                <img class="me-1" src="./assets/my-pic-1.jpg" alt="my picture">
                <img class="me-2" src="./assets/my-pic-2.jpg" alt="my picture">
                <img class="me-3" src="./assets/my-pic-3.jpg" alt="my picture">
            </div>
            <div class="about-me">
                <h2 class="introduction">Introduction</h2>
                <div>
                    <p class="all-the-words">
                        My name is Hen Haim, I was adjutant corps officer for more than three years at the resources management division, I have a bachelor's degree in life-sciences from Ben-Gurion university, I worked as a laboratory assistant for over a year and even worked abroad for about a year and a half.<br><br>
                        To this date, I am a student at "John Bryce Learning Center" taking a "full stack web developers" course to become a programmer.<br><br>
                    </p>
                    <p class="all-the-words">
                        "Believe you can and you're halfway there." <strong>Theodore Roosevelt</strong><br><br>
                    </p>
                    <p class="all-the-words">
                        For me this quote implies that everything is possible if you just give it a try and believe in yourself.<br><br>
                        Many times we are told not to dare, not to take risks and to not even think about following our dreams and that is just plain wrong, because scary as it may, there is nothing more fulfilling. <br><br>
                        Years of experience in various fields had taught me numerous skills, expanded my worldview and provided me the strength to overcome everything; hence I am still here fighting for my dreams.<br><br>
                        During the course I learned:<br>
                        HTML + HTML5, Advanced CSS, Bootstrap, Advanced Java Script, JQUERY, Web Services + REST + AJAX, OOP With TypeScript<br><br>
                        Later in the course we will learn:<br>
                        React.js, Node.js Advanced, MYSql, Angular and more ...<br><br>
                        Link to my Git account:<br>
                        https://github.com/Hen-Haim<br><br>
                        In every area of life I have been involved it has been important for me to progress and therefore, I have learned to work hard, I understand things quickly and like to challenge myself and therefore any project given to me will be carried out in the most torturous and unique way, like the above project.<br><br>
                        This project was done with a lot of thought, activating creativity and could show a little bit of my way of thinking.
                    </p>
                </div>
            </div>
            `
        }
    } catch (error) {
        console.log("oh no! problem with making the About", error)
    }
}


// *************************************************************************************************//
// **********-----clearing the 6th switch if the user didn't pick it from the modal-----***********//
const clearingTheFive=()=>{
    if(coinsSymbol[5]){
        coinsSymbol.splice(5, 1);
        localStorage.setItem("limitFive", JSON.stringify(coinsSymbol));
    }
    isMoreThanFive = false;
    coinsInit();
}

// *************************************************************************************************//
// ***************************-----creating the progress bar-----**********************************//
const circleProgressBar = () => {
    try{
        //changing the degrees key so it would be as the the percentage:
        var degrees = Math.floor(myBarPercent/100*360);

        //animating the circle:
        $('.outer-circle').animate(
            {deg: degrees},
            {duration: 5},
            {step: ()=> {
                    $(this).css({
                    transform: 'rotate(' + degrees + 'deg)'
                    });
                }
            }
        );
        //rotating the circle after the last degrees so that each time the loading upgrade it would be 
        //from the same spot it was when it start.
        document.querySelector('.outer-circle').style.transform = `rotate(${Math.floor(myBarPercent/100*360)}deg)`;

        //getting the span to write the percentages:
        var span = document.querySelector(".span-for-circle");    
        span.textContent = myBarPercent + '%';

    } catch (error) {
        console.log("oh no! problem with making the ProgressBar", error)
    }
}

// ***********************************************************************************************//
// ***********************-----making the progress bar visible-----******************************//
const animateProgressBar = () =>{
    $(".my-content-progress").css({visibility:"visible"},{opacity: 0.0}).animate(
        {opacity: 1.0},
        {duration: 5});  
}

// ***********************************************************************************************//
// ************************-----making the "latest-interest" div -----***************************//
const yourLatestUpdate = (update,where) =>{
    try{
        let divContainer = document.querySelector(".latest-update-content");
        divContainer.innerHTML="";
        let createDiv = document.createElement("div");
        divContainer.appendChild(createDiv);

        //if "update" is defined then this happen:
        if(update!==undefined){
            if(latest.length===10){
                latest.pop();
            }
            //creating the object from top to bottom:
            latest.unshift({
                flag: update.image.thumb,
                name: update.symbol.toUpperCase(),
                how: where,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            });
            localStorage.setItem("latest", JSON.stringify(latest));
        }

        latest.forEach(latestObject=>{
            let createDiv = document.createElement("div");
            divContainer.appendChild(createDiv);
            createDiv.classList.add("organizing-the-updates",`latest-${latestObject.name}`)
            createDiv.innerHTML = `
                <img src="${latestObject.flag}"class="latest-update-${latestObject.how}"></img>
                <div class="latest-for-p">
                    <p class="latest-update-${latestObject.how}">${latestObject.name}</p>
                    <p class="latest-update-${latestObject.how}">${latestObject.time}</p>
                    <p class="latest-update-${latestObject.how}">${latestObject.how}</p>
                </div>
        `});

    } catch (error) {
        console.log("oh no! problem with making the latest-interest div", error)
    }
}

// ***********************************************************************************************//
// ******************************-----making the menu "active"-----******************************//
const activating = (menu) =>{
    let barMenu = document.querySelectorAll(".my-nav-item");
    barMenu.forEach(item=>{
        if(item.classList.contains("active")){
            item.classList.remove("active");
        }
        if(item.classList.contains(`${menu}`)){
            item.classList.add("active");
        }
    })
}


// *************************************************************************************************//
// ************************************----- loading the page-----*********************************//
window.onload= ()=>{
    try{
        coinsInit();
        //initiate/getting the limitFive coins and the "coinsSymbol" array:
        if(localStorage.getItem("limitFive")){
            coinsSymbol = JSON.parse(localStorage.getItem("limitFive"));
        }else{
            coinsSymbol = [];
            localStorage.setItem("limitFive", JSON.stringify(coinsSymbol)); 
        }
        //initiate/getting the temporary coins and the "temporary" array
        //and asking if the timeout for all the coins has ran out:
        if (sessionStorage.getItem("temporary")) {
            temporary = JSON.parse(sessionStorage.getItem("temporary"));
        }else{
            temporary = [];
            sessionStorage.setItem("temporary", JSON.stringify(temporary)); 
        }
        
        //initiate/getting the latest interests and the "latest" array:
        if (localStorage.getItem("latest")) {
        latest = JSON.parse(localStorage.getItem("latest"));
            yourLatestUpdate();
    
        }else{
            latest = [];
            localStorage.setItem("latest", JSON.stringify(latest)); 
        }
        // doTheRightTimeOut()

        //if you pressed refresh before pressing x on the modal it will show you the modal again with this:
        if(coinsSymbol.length===6){openModal(coinsSymbol.slice(0,-1))};
    } catch (error) {
        console.log("oh no! problem with loading the page", error)
    }
}


