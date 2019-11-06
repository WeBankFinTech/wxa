// wxa自定义拓展的mock规则

export default function extend(random) {
    return {
        // 身份证号
        idNo,
        // 星座
        constellation
    }
}

function idNo(oldest, youngest) {
    return getIDCardNo(this, oldest, youngest);
}

function constellation(rule) {
    let constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座']
    return this.pick(constellations)
}


// 生成身份证号
function getIDCardNo(mock, oldest, youngest) {
    let coefficientArray = [ "7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"];// 加权因子
    let lastNumberArray = [ "1","0","X","9","8","7","6","5","4","3","2"];// 校验码
    let address = "420101"; // 住址
    let oldestYear = oldest ? oldest : 1900;
    let youngestYear = youngest ? youngest : 2019;
    // let year = getRandom(youngestYear, oldestYear);
    let year = mock.natural(youngestYear, oldestYear);
    let month = paddingZero(mock.natural(1, 12));
    let date = paddingZero(mock.natural(1, 28));
    let birthday = `${year}${month}${date}`; // 生日

    let s = Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString() + Math.floor(Math.random()*10).toString();
    let array = (address + birthday + s).split(""); 
    let total = 0;
    for(let i in array){
        total = total + parseInt(array[i])*parseInt(coefficientArray[i]);
    } 
    let lastNumber = lastNumberArray[parseInt(total%11)];
    let id_no_String = address + birthday + s + lastNumber;
    return id_no_String;
}


function paddingZero(num) {
    let number = num + '';
    let res = (Number(num) > 9) ? number : 0 + number;
    return res;
}
