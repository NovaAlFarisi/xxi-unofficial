const request = require('request');
const cheerio = require('cheerio');

const getCity = (cb) => {
    var target = 'https://m.21cineplex.com/gui.list_city.php?sid=';
    request.get(target, (error, response, html)=>{
        const $ = cheerio.load(html);
        var list_city = [];
        $('.list-group-item > div').each((i, val)=>{
            var city_id = val.children[0].parent.attribs['onclick'].replace(`location.href='gui.list_theater.php?sid=&city_id=`, '').replace(`';`, '');;
            var city_name = val.children[0].data;
            list_city.push({
                city_name:city_name,
                city_id: city_id
            })
        })
        return cb(list_city)
    })
}

const getTheater = (city_id, cb) => {
    var target = `https://m.21cineplex.com/gui.list_theater.php?sid=&city_id=${city_id}`;
    request.get(target, (error, response, html)=> {
        const $ = cheerio.load(html);
        var list_theater = [];
        var theatherSync, cinemaIdSync;
        $('.list-group-item > div').each((i, value)=>{
            if(value.children[0].type == 'text'){
                cinemaIdSync = value.children[0].parent.attribs['onclick'].split('&')[2].replace('cinema_id=','');
                theatherSync = value.children[0].data
            } else {
                cinemaIdSync = value.children[1].parent.attribs['onclick'].split('&')[2].replace('cinema_id=','');
                theatherSync = value.children[1].data;
            }
            list_theater.push({
                theater_id:cinemaIdSync,
                theater_name:theatherSync
            })
        })
        return cb(list_theater)
    })
}

const getPlayingNow = (theater_id, cb) => {
    var target = `https://m.21cineplex.com/gui.schedule.php?sid=&find_by=1&cinema_id=${theater_id}&movie_id=`;
    request.get(target, (error, response, html)=>{
        const $ = cheerio.load(html);
        var playing_list = [];
        $('.list-group-item').each((i, value)=>{
            var movId = value.children[1].children[0].parent.attribs['href'];
            var safeId = movId.split('&')[1].replace('movie_id=','')
            var playing_schedule = [];
            $('.p_time').each((i,value)=>{
                playing_schedule.push(value.children[0].children[0].data)
            })
            playing_list.push({
                movie_id:safeId,
                movie_name:value.children[2].next.children[0].data,
                movie_thumb:value.children[1].children[0].next.attribs['src'],
                movie_type:value.children[1].parent.children[7].children[0].data,
                movie_duration:value.children[1].parent.children[11].children[1].data,
                age_limit:value.children[1].parent.children[9].children[0].data,
                price:$('.p_price')[i].children[0].data,
                playing_schedule: playing_schedule
            })
        })
        console.log(playing_list)
    })
}
