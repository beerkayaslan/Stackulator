var metaInfoUrl = "https://api.stacking.club/api/meta-info";
var cycleInfoUrl = "https://api.stacking.club/api/cycle-info?cycle=";

var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// cycle length
const maxCycles = 12;

// cycle day
const cycleDay = 14;

// cycle duration card each length
const cycleDurationEach = 14;

const per_year_variable = 25;

// default amount in stx
const defaultAmountSTX = 1000;

// bitcoin price and stx coin price
var minimumThreshold, APY, btcPrice, stxPrice,
    user_minimumThreshold, user_btcPrice, user_stxPrice, user_APY;

var mode = "simple";

var poolFee = 5;

var ApiCycles, userCycles;

var nowCurrentCycle = 13;

var NowCycleVariables;


function percentRemove(number, percent) {
    return number - (number * (percent / 100));
}

const calc = async (per_year) => {
    const meta_info = await fetch('https://api.stacking.club/api/meta-info')
        .then(response => response.json());

    btcPrice = parseFloat(meta_info[1].btc).toFixed(2);
    stxPrice = parseFloat(meta_info[1].stx).toFixed(2);

    $("#stx span").text("$" + numberWithCommas(parseFloat(stxPrice).toFixed(2)));
    $("#btc span").text("$" + numberWithCommas(parseFloat(btcPrice).toFixed(2)));

    $("#input-stx").val(numberWithCommas(parseFloat(stxPrice).toFixed(2)));
    $("#input-btc").val(numberWithCommas(parseFloat(btcPrice).toFixed(2)));

    $("#input-stx-amount").val(defaultAmountSTX.toFixed(2));
    $("#input-usd-provision-price").val(numberWithCommas((parseFloat(numberWithRemoveCommas(defaultAmountSTX)) * stxPrice).toFixed(2)));

    return Array(meta_info[0].pox.current_cycle.id + 1).fill().map((v, i) => i + 1).map(x => calculateAPY(x, per_year));
}

const calculateAPY = async (current_cycle, per_year) => {
    const cycle = await fetch(`https://api.stacking.club/api/cycle-info?cycle=${current_cycle}`)
        .then(response => response.json());

    if (current_cycle <= 13) {
        const historicalPrices = Object.values(cycle.historicalPrices)[0];

        var historicalPricesstx = parseFloat(historicalPrices.stx).toFixed(2);

        var historicalPricesbtc = parseFloat(historicalPrices.btc).toFixed(2);

        var minimumThresholdStx = parseFloat(cycle.minimumThreshold).toFixed(2);

        const cyclesPerYear = per_year;

        const averageCyclesLocked = cycle.averageCycles;

        const cyclesMissed = cyclesPerYear / averageCyclesLocked;

        const cyclesWithRewards = cyclesPerYear - cyclesMissed;

        const costToStackUsd = historicalPricesstx * minimumThresholdStx;

        const rewardsUsd = historicalPricesbtc * cycle.averageReward;

        const yearlyRewards = rewardsUsd * cyclesWithRewards;

        if (nowCurrentCycle == current_cycle) {
            NowCycleVariables = cycle;
        }

        return { current_cycle, apy: (yearlyRewards / costToStackUsd) * 100, cycle };

    } else {
        return { current_cycle, cycle };
    }
}

const Main = async () => {
    const a = await Promise.all(await calc(per_year_variable));

    a.reverse();

    a.forEach(x => {

        const startDate = new Date(x.cycle.startDate);
        const startMonth = month[startDate.getMonth()];
        const startYear = startDate.getFullYear();
        const startDay = startDate.getDate();

        const endDate = new Date(x.cycle.endDate);
        const endMonth = month[endDate.getMonth()];
        const endYear = endDate.getFullYear();
        const endDay = endDate.getDate();

        const totalRewardsBtc = x.cycle.totalRewardsBtc;
        const totalStackers = x.cycle.totalStackers;

        const rewardSlots = x.cycle.rewardSlots;
        const apr = x.apy != undefined ? x.apy.toFixed(1) : "?";

        const tvl = (x.cycle.totalStacked / 1000000).toString().substring(0, 5).split("");
        tvl.splice(3, 0, '.');

        var current_cycle_text = "";
        var current_cycle_text_color = "";
        var rightText = `<div class="r">
        <span class="icon-b">🎉</span>
        <span>Completed!</span>
    </div>`;

        switch (x.current_cycle) {
            case 14:
                current_cycle_text = "upcoming";
                current_cycle_text_color = "orange";
                rightText = "";
                break;
            case 13:
                current_cycle_text = "current";
                current_cycle_text_color = "green";
                rightText = `<div class="r">
            <span class="icon-b">₿</span>
            <span>Proof-of-Transfer</span>
        </div>`;
                minimumThreshold = x.cycle.minimumThreshold;
                $("#input-minimum-threshold").val(numberWithCommas(minimumThreshold));
                totalStacked = x.cycle.totalStacked;
                $("#calc-text-4").html("Ӿ" + numberWithCommas(minimumThreshold));
                APY = apr;
                break;
            case 12:
                rightText = `<div class="r">
            <span class="icon-b">🔥</span>
            <span> Proof-of-Burn</span></div>`;
                break;
            default:
                break;
        }

        $(".cycles .swiper-wrapper").append(`<div class="swiper-slide">
            <div class="slide-cycle-elem">
                <div class="top">
                    <span class="l">Cycle ${x.current_cycle} <small style="color:${current_cycle_text_color};">${current_cycle_text}</small></span>
                    ${rightText}
                </div>
                <div class="info-box">
                    <div>
                        <small>Started</small>
                        <span>${startMonth} ${startDay}, ${startYear}</span>
                    </div>
                    <div class="align-items-end">
                        <small>Ended</small>
                        <span>${endMonth} ${endDay}, ${endYear}</span>
                    </div>
                </div>
                <div class="info-box">
                    <div>
                        <small>TVL</small>
                        <span>${tvl.join("")}M STX</span>
                    </div>
                    <div class="align-items-center">
                        <small>APR</small>
                        <span>${apr}%</span>
                    </div>
                    <div class="align-items-end">
                        <small>Rewards</small>
                        <span>${totalRewardsBtc != undefined ? totalRewardsBtc.toFixed(3) : "?"} BTC</span>
                    </div>
                </div>
                <div class="info-box">
                    <div>
                        <small>Participation</small>
                        <span>${totalStackers} stackers</span>
                    </div>
                    <div>
                        <small></small>
                        <span>${rewardSlots} slots</span>
                    </div>
                </div>
            </div>
        </div>`);

    });

    var swiper = new Swiper(".cycles", {
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },

        breakpoints: {
            // when window width is >= 320px
            320: {
                slidesPerView: 1,
                spaceBetween: 20
            },
            // when window width is >= 480px
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            // when window width is >= 640px
            1100: {
                slidesPerView: 3,
                spaceBetween: 20
            }
        }
    });

    changeMode(mode);
}

Main();

function changeMode(mode) {
    if (mode == "simple") {
        $(".calc-text-5").hide();
        var USD = parseFloat(numberWithRemoveCommas($("#input-usd-provision-price").val().length == 0 ? "1" : $("#input-usd-provision-price").val()));
        var cycleLength = parseFloat($("#cycleDaySelect").val());
        var UsdInterest = ((USD * (APY / 12) / 30 * (cycleLength * cycleDurationEach)) / 100).toFixed(2);
        var yearUsd = ((APY * USD) / 100).toFixed(2);

        $(".cycle-length-span").html(cycleLength);
        $("#calc-text-4").html("Ӿ" + numberWithCommas(minimumThreshold));
        $("#calc-text-1").html("Ӿ" + numberWithCommas((UsdInterest / stxPrice).toFixed(2)));
        $("#calc-text-2").html("$" + numberWithCommas(UsdInterest));
        $("#calc-text-3").html("₿" + (UsdInterest / btcPrice).toFixed(9));
        $(".btc-per-year-h1").attr("btc", (yearUsd / btcPrice).toFixed(9) + " BTC").attr("dollar", `$${numberWithCommas(yearUsd)} (${APY}%)`);

    } else {
        $(".calc-text-5").show();
        var cycleLength = parseFloat($("#cycleDaySelect").val());
        var USD = parseFloat(numberWithRemoveCommas($("#input-usd-provision-price").val().length == 0 ? "1" : $("#input-usd-provision-price").val()));

        user_minimumThreshold = parseFloat(numberWithRemoveCommas($("#input-minimum-threshold").val().length == 0 ? "1" : $("#input-minimum-threshold").val()));
        poolFee = parseInt($("#input-pool-fee").val().length == 0 ? "1" : $("#input-pool-fee").val()) > 100 ? 100 : parseInt($("#input-pool-fee").val().length == 0 ? "1" : $("#input-pool-fee").val());
        user_btcPrice = parseFloat(numberWithRemoveCommas($("#input-btc").val().length == 0 ? "1" : $("#input-btc").val()));
        user_stxPrice = parseFloat(numberWithRemoveCommas($("#input-stx").val().length == 0 ? "1" : $("#input-stx").val()));


        $("#calc-text-5").html(poolFee + "%");

        var historicalPricesstx = user_stxPrice;

        var historicalPricesbtc = user_btcPrice;

        var minimumThresholdStx = user_minimumThreshold;

        var cyclesPerYear = per_year_variable;

        var averageCyclesLocked = NowCycleVariables.averageCycles;

        var cyclesMissed = cyclesPerYear / averageCyclesLocked;

        var cyclesWithRewards = cyclesPerYear - cyclesMissed;

        var costToStackUsd = historicalPricesstx * minimumThresholdStx;

        var rewardsUsd = historicalPricesbtc * NowCycleVariables.averageReward;

        var yearlyRewards = rewardsUsd * cyclesWithRewards;

        user_APY = (yearlyRewards / costToStackUsd) * 100;

        var UsdInterest = ((USD * (user_APY / 12) / 30 * (cycleLength * cycleDurationEach)) / 100).toFixed(2);
        var yearUsd = ((user_APY * USD) / 100).toFixed(2);

        $(".cycle-length-span").html(cycleLength);
        $("#calc-text-4").html("Ӿ" + numberWithCommas(user_minimumThreshold));
        $("#calc-text-1").html("Ӿ" + numberWithCommas(percentRemove((UsdInterest / user_stxPrice), poolFee).toFixed(2)));
        $("#calc-text-2").html("$" + numberWithCommas(percentRemove(UsdInterest, poolFee).toFixed(2)));
        $("#calc-text-3").html("₿" + percentRemove(UsdInterest / user_btcPrice, poolFee).toFixed(9));
        $(".btc-per-year-h1").attr("btc", percentRemove(yearUsd / user_btcPrice, poolFee).toFixed(9) + " BTC").attr("dollar", `$${numberWithCommas(percentRemove(yearUsd, poolFee).toFixed(2))} (${parseFloat(percentRemove(user_APY,poolFee)).toFixed(1)}%)`);

    }
}

$("#calc-text-5").val(poolFee);

$(document).on("input", ".form-group input", function () {
    changeMode(mode);
});



$(document).on("input", ".form-group select", function () {
    changeMode(mode);
});


$(document).on("input", "#input-usd-provision-price", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
    }
    if (mode == "simple") {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / stxPrice).toFixed(2)));
    } else {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / user_stxPrice).toFixed(2)));
    }
});

$(document).on("focusout", "#input-usd-provision-price", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
        $(this).val(val);
    }

    if (mode == "simple") {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / stxPrice).toFixed(2)));
    } else {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / user_stxPrice).toFixed(2)));
    }
    changeMode(mode);
});

$(document).on("input", "#input-stx-amount", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
    }

    if (mode == "simple") {
        $("#input-usd-provision-price").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) * stxPrice).toFixed(2)));
    } else {
        $("#input-usd-provision-price").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) * user_stxPrice).toFixed(2)));
    }
    changeMode(mode);
});

$(document).on("focusout", "#input-stx-amount", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
        $(this).val(val);
    }

    if (mode == "simple") {
        $("#input-usd-provision-price").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) * stxPrice).toFixed(2)));
    } else {
        $("#input-usd-provision-price").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) * user_stxPrice).toFixed(2)));
    }
    changeMode(mode);
});

$(document).on("input", "#input-stx", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
    }
    $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas($("#input-usd-provision-price").val())) * parseFloat(numberWithRemoveCommas(val))).toFixed(2)));
    changeMode(mode);
});

$(document).on("focusout", "#input-stx", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
        $(this).val(val);
    }
    changeMode(mode);
});

$(document).on("input", "#input-btc", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
    }
    changeMode(mode);
});

$(document).on("focusout", "#input-btc", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
        $(this).val(val);
    }
    changeMode(mode);
});

$(document).on("input", "#input-minimum-threshold,#input-pool-fee", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
    }
});

$(document).on("focusout", "#input-minimum-threshold,#input-pool-fee", function () {
    var val = $(this).val();
    if (val == undefined || val.length == 0) {
        val = "1";
        $(this).val(val);
    }
    changeMode(mode);
});


// advanced and simple button click function
$(document).on("click", ".tab-btn > button:not(.active)", function () {
    $(".tab-btn > button").removeClass("active");
    $(this).addClass("active");
    if ($(this).hasClass("simple-btn")) {
        $(".tab-btn > span").removeClass("right");
        $("[advanced]").fadeOut("fast");
        mode = "simple";

    } else {
        $(".tab-btn > span").addClass("right");
        $("[advanced]").fadeIn("fast");
        mode = "advanced";
    }

    changeMode(mode);

    var val = $("#input-usd-provision-price").val();

    if (mode == "simple") {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / stxPrice).toFixed(2)));
    } else {
        $("#input-stx-amount").val(numberWithCommas((parseFloat(numberWithRemoveCommas(val)) / user_stxPrice).toFixed(2)));
    }
});

// cycle day append and first select
for (var i = 1; i <= maxCycles; i++) {
    $("#cycleDaySelect").append(`<option value="${i}" selected>${i} Cycle (Average ~ ${i * cycleDay} Days)</option>`);
}

$("#cycleDaySelect option:first").prop("selected", "selected");

$(function(){
    $('[data-toggle="tooltip"]').tooltip();
});


// range slider each and active function
$(".range-slider-container").each(function () {
    var input = $(this).find("input.form-control");
    $(this).find(".range-slider").slider({
        value: parseInt(input.val()),
        orientation: "horizontal",
        range: "min",
        slide: function (event, ui) {
            input.val(ui.value);
            changeMode(mode);
        }
    });
});

// range input each and active
$(document).on("input", ".range-slider-container input", function () {
    var val = $(this).val();
    if (parseInt(val) > 100) {
        $(this).val(100);
    }else if(val == undefined || val.length == 0){
        val = 1;
    }
    $(this).closest(".range-slider-container").find(".range-slider").slider("value", val);
});

function numberWithCommas(x) {
    return x;
}

function numberWithRemoveCommas(x) {
    return x;
}


// faq list open and close function
$(document).on("click", ".faq-list > div > .t", function () {
    $(this).parent().find(".b").slideToggle("fast");
    $(this).parent().toggleClass("active");
});

$("#input-pool-fee").mask('000');
$("#input-stx,#input-btc,#input-usd-provision-price,#input-stx-amount").mask('000000000000000.00', { reverse: true } );
$("#input-minimum-threshold").mask('000000000000000');