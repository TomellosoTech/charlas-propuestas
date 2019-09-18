const talksUrl = 'https://spreadsheets.google.com/feeds/list/1_jMY6CMf9oKhDxzn_NRrUPtu6f-h8cxVkqy7KOE_m2U/1/public/values?alt=json-in-script&callback=loadTalks';
$.ajax({
    url: talksUrl,
    jsonp: "loadTalks",
    dataType: "jsonp",
    data: {format: "json"}
});

function loadTalks(data){
    window.talks = [];

    const tags = [
        ['Herramientas y lenguajes de programación', 'programming'],
        ['Tendencias tecnológicas', 'future'],
        ['Robótica, electrónica', 'robotics'],
        ['Herramientas y técnicas de productividad', 'post-it'],
        ['Marketing online', 'marketing'],
        ['Diseño gráfico', 'design'],
        ['Emprendimiento', 'business'],
        ['Buen uso de la tecnología', 'cyber-security']
    ];

    const colorPalette = ['#DB4367', '#EB4B38', '#AC4988', '#705390', '#3F5279', '#2F4857'];

    data.feed.entry.forEach(element => {
        let talkTags = [];

        let talk = {
            index: talks.length,
            title: element.gsx$title.$t,
            description: element.gsx$description.$t,
            length: element.gsx$length.$t,
            speakers: element.gsx$speakers.$t,
            categories: element.gsx$categories.$t,
            tags: parseCategories(element.gsx$categories.$t,tags),
            level: element.gsx$level.$t,
            comments: element.gsx$comments.$t
        };

        tags.forEach(tag => {
            if(talk.categories.indexOf(tag[0]) != -1){
                talkTags = talkTags.concat(tag[1].split(','));
            }
        });
        talk.titleColor = colorPalette[getRandomInt(0, colorPalette.length)];
        talk.tags = talkTags.join(',');

        talk['description'] = linkify(talk['description']);
        talk['description'] = talk['description'].replace(/(?:\r\n|\r|\n)/g, '<br>');

        talks.push(talk)
    });

    const template = $.templates("#talkTmpl");
    const htmlOutput = template.render({talks});
    $("#talks").html(htmlOutput);
}

function parseCategories(categories, tags=tags){
    var output = [];
    tags.forEach(tag => {
        if(categories.indexOf(tag[0]) !== -1){
            output.push(tag[1]);
        }
    });
    return output.join(',');
}

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showModal(id) {
    [
        'title', 'description', 'level', 'length', 'speakers',
        'comments'
    ].forEach( attr => {
        let output = linkify(talks[id][attr]);
        output = output.replace(/(?:\r\n|\r|\n)/g, '<br>');
        output = output? output : 'n.a.'
        document.getElementById(`modal-${attr}`).innerHTML = output;
    })

    document.getElementById('modal-categories').innerHTML = talks[id].categories.split('..., ').join('...<br>')


    MicroModal.show('modal');
    console.log(talks[id]);
}

document.querySelectorAll('#categoryFilter li').forEach(elem => {
    elem.addEventListener('click', function(e) {
        console.log("Hecho: ",e.currentTarget)
        document.querySelector('#categoryFilter .active').classList.remove('active');
        e.currentTarget.classList.add('active');
        const dataCategory = e.currentTarget.getAttribute('data-category');

        if(dataCategory === 'all'){
            let showEls = document.querySelectorAll(`li.hide`);
            showEls.forEach(elem => elem.classList.remove('hide'));
        }else{
            let showEls = document.querySelectorAll(`li[data-tags*="${dataCategory}"].hide`);
            showEls.forEach(elem => elem.classList.remove('hide'));

            let hideEls = document.querySelectorAll(`#talks li:not([data-tags*="${dataCategory}"])`);
            hideEls.forEach(elem => elem.classList.add('hide'));
        }
    });
});
