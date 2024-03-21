console.log("Hello World..");
let currSong;
let songs;
let currFolder;
function secondsToMinutesToSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<div class="playSong flex">
        <img class="invert" src="img/music.svg" alt="" width="40px" height="40px">
        <div class="songinfo">
        <div class="song-name">${song.replaceAll("%20", " ").split("-")[0].replace("/", "")}</div>
        <div class="singer">${song.replaceAll("%20", " ").split("-")[1].replaceAll(".mp3", "")}</div>
        </div>
        <img class="gif" src="img/play.svg" alt="" width="40px" height="30px">
        </div>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByClassName("playSong")).forEach(e => {
        e.addEventListener("click", element => {
            let sname = e.querySelector(".song-name").innerHTML;
            let siname = e.querySelector(".singer").innerHTML;
            playMusic(sname + "-" + siname + ".mp3");
            let actualSong = sname + "-" + siname;
            document.querySelector(".songName").innerHTML = actualSong;


        })
    })
    return songs;
}

const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "img/pause.svg";
    }
    let nextSong = track.replaceAll("%20", "").replace(/([A-Z])/g, ' $1').replace(/-/g, ' -').trim().replace(".mp3", "").replace("/", "");
    document.querySelector(".songName").innerHTML = nextSong;
}

async function displayAlbums() {
    let a = await fetch(`/Songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".playlist-box");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/Songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <img src="Songs/${folder}/cover.jpeg" alt="">
            <img class="spotifyPlay" src="img/spotify-play.svg" alt="">
            <div class="playlist-name">${response.title}</div>
            <div class="playlist-des">${response.description}</div>
        </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            let nextSong = songs[index - 1];
            playMusic(nextSong);
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0]);
        console.log(index);
        if (index + 1 < songs.length) {
            let nextSong = songs[index + 1].replaceAll("/", "");
            playMusic(nextSong);
        }
    })
}

async function main() {
    currSong = new Audio();
    await getSongs("Songs/top20");

    displayAlbums();

    let playsong = document.querySelector(".song-name").innerHTML + "-" + document.querySelector(".singer").innerHTML + ".mp3";
    playMusic(playsong, true);

    document.querySelector(".songName").innerHTML = playsong.replace(".mp3", "");
    document.querySelector(".duration").innerHTML = `${secondsToMinutesToSeconds(currSong.currentTime)}/${secondsToMinutesToSeconds(currSong.duration)}`;

    let songGif = document.querySelector(".gif");
    

    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currSong.pause();
            play.src = "img/play2.svg";
            // songGif.src = "graph2.svg";
        }
    })


    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = `${secondsToMinutesToSeconds(currSong.currentTime)}/${secondsToMinutesToSeconds(currSong.duration)}`
        let scrollwidth = (currSong.currentTime / currSong.duration) * 100 + "%";
        document.querySelector(".scroll").style.left = scrollwidth;
        if(scrollwidth == "100%"){
            play.src = "img/play.svg";
        }
        // document.querySelector(".seekbar1").style.width = scrollwidth;
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".scroll").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100;
        document.querySelector(".seekbar1").style.width = scrollwidth;
    })

    // document.querySelector(".seekbar1").addEventListener("click", e=>{
    //     // let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
    //     document.querySelector(".scroll").style.left = percent + "%";
    //     currSong.currentTime = ((currSong.duration)* percent)/100;
    //     document.querySelector(".seekbar1").style.width = scrollwidth;
    // })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    

    changevolume.addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
        if(e.target.value == 0){
            document.querySelector(".yesvol").style.display = "none";
            document.querySelector(".novol").style.display = "block";
        }
    //    document.querySelector(".yesvol").style.display = "block";
    })

    document.querySelector(".yesvol").addEventListener("click", () => {
        document.querySelector(".yesvol").style.display = "none";
        document.querySelector(".novol").style.display = "block";
        currSong.volume = 0;
        changevolume.value = 0;
    })

    document.querySelector(".novol").addEventListener("click", () => {
        document.querySelector(".yesvol").style.display = "block";
        document.querySelector(".novol").style.display = "none";
        currSong.volume = 0.3;
        changevolume.value = 30;
    })


}
main();   
