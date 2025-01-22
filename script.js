// ==UserScript==
// @name     Rule34.xxx tweaks
// @version  1
// @grant    GM.setValue
// @grant    GM.getValue
// ==/UserScript==


const defaultColors = {
    background: "rgb(170, 229, 164)",
    accent: "#93c393",
  
    link:   "rgb(0, 0, 153)",
  
    //tags
    copyright: "rgb(170, 0, 170)",
    character: "rgb(0, 170, 0)",
    artist:    "rgb(170, 0, 0)",
    general:   "rgb(0, 0, 153)",
    metadata:  "rgb(255, 136, 0)"
}


async function applyTheme() {
  
    const style = document.createElement("style");
    style.type  = "text/css";
    document.getElementsByTagName('head')[0].appendChild(style);
  
  
    //background color
    await (GM.getValue("theme.background", defaultColors.background)).then((bgColor)=>{
      
        style.innerHTML += `body, .awesomplete > ul {background:${bgColor}}`;
        style.innerHTML += `.current-page {background-image:none !important}`; //default background image is green
      
    });
  
    //accent  
    await (GM.getValue("theme.accent", defaultColors.accent)).then((accent)=>{
        style.innerHTML += `#pageid, .manual-page-chooser > input[type="submit"]  {background-color: ${accent}}`;
        style.innerHTML += `#subnavbar {background: ${accent} !important}`;   
    });
  
    //classless links
    await (GM.getValue("theme.link", defaultColors.link)).then((linkColor)=>{
        style.innerHTML += `a:link {color: ${linkColor}}`;         
    });
  
  
    //tags
    await (GM.getValue("theme.tags.copyright", defaultColors.copyright)).then((linkColor)=>{
        style.innerHTML += `.tag-type-copyright > a, .tag-type-copyright {color: ${linkColor}}`;         
    });
    await (GM.getValue("theme.tags.character", defaultColors.character)).then((linkColor)=>{
        style.innerHTML += `.tag-type-character > a, .tag-type-character {color: ${linkColor}}`;         
    });
    await (GM.getValue("theme.tags.artist", defaultColors.artist)).then((linkColor)=>{
        style.innerHTML += `.tag-type-artist > a, .tag-type-artist {color: ${linkColor}}`;         
    });
    await (GM.getValue("theme.tags.general", defaultColors.general)).then((linkColor)=>{
        style.innerHTML += `.tag-type-general > a, .tag-type-general {color: ${linkColor}}`;         
    });
    await (GM.getValue("theme.tags.metadata", defaultColors.metadata)).then((linkColor)=>{
        style.innerHTML += `.tag-type-metadata > a, .tag-type-metadata {color: ${linkColor}}`;         
    });

}


//function to get all stored settings. Returns object containing fulfilled promises once every single promise is fulfilled
async function getSettings() {
    const settings = {
        blacklist: GM.getValue("blacklist", ""),
        regexBlacklist: GM.getValue("regexBlacklist", ""),
        //minscore: GM.getValue("minscore", "0"),
        theme: {
            background: GM.getValue("theme.background", defaultColors.background),
            accent:     GM.getValue("theme.accent", defaultColors.accent),
            link:       GM.getValue("theme.link", defaultColors.link),
            tags: 
            {
                copyright: GM.getValue("theme.tags.copyright", defaultColors.copyright),
                character: GM.getValue("theme.tags.character", defaultColors.character),
                artist:    GM.getValue("theme.tags.artist", defaultColors.artist),
                general:   GM.getValue("theme.tags.general", defaultColors.general),
                metadata:  GM.getValue("theme.tags.metadata", defaultColors.metadata)
            }
        }
    };
  
    await Promise.all(Object.values(settings)
        .concat(Object.values(settings.theme))
        .concat(Object.values(settings.theme.tags))
    );

    return settings;
  
}






//create row for table to be used in settings page, near duplicate CSS to that of the standard settings page.
function createRow(name, desc, data) {
    const row = document.createElement("tr");
    const th = document.createElement("th");
    th.width = "15%";
  
    const label = document.createElement("label");
    label.classList.add("block");
    label.innerHTML = name;
    th.appendChild(label);
  
    const p = document.createElement("p");
    p.innerHTML = desc;
    th.appendChild(p);
  
    row.appendChild(th);
  
    const td = document.createElement("td");
    td.width = "85%";
    td.appendChild(data);
    row.appendChild(td);
  
    return row;

}




async function generateSettingsPage() {
  
  
    //show settings as currently selected page
    const navbar = document.getElementById("navbar");
    document.getElementsByClassName("current-page")[0].classList.remove("current-page");
    navbar.children[0].classList.add("current-page");
    navbar.children[1].children[0].addEventListener("click", generateFavoritesPage); //reenable favorites link if disabled
    navbar.children[0].children[0].removeEventListener("click", generateSettingsPage);
  
    //hide subnavbar
    document.getElementById("subnavbar").style.display = "none";

  
  
    const content = document.getElementById("content");
    const notice = document.getElementById("notice");
  
    //show a blank page while we wait for getSettings
    content.innerHTML = "";
    notice.style.display = "none";
    //notice.innerHTML = "";
  
  
    await getSettings().then(async (settings) => {
        const table = document.createElement("table");
        table.classList.add("form");
        const tbody = document.createElement("tbody");
        table.appendChild(tbody);

        content.appendChild(table);
      
        const blacklistHeader = document.createElement("tr");
        blacklistHeader.style.textAlign = "center";
        blacklistHeader.innerHTML = "<td colspan=2><h3>Blacklist Settings</h3><h6>You may format these blacklists with line breaks or several consecutive spaces. Lines starting with # will be treated as comments.</h6></td>";
        tbody.appendChild(blacklistHeader);
      
      
        const blacklistArea = document.createElement("textarea");
        blacklistArea.id = "tags";
        blacklistArea.cols = 80;
        blacklistArea.name = "tags";
        blacklistArea.rows = 6;
        blacklistArea.autocomplete = "off";
        blacklistArea.ariaAutoComplete = "list";
      

        tbody.appendChild(createRow("Tag Blacklist","Any post containing a blacklisted tag will be ignored. Note that you can also blacklist ratings and users.<br>Tip: Searching for <span style=\"font: monospace\">score:>5</span> will show fewer improperly tagged posts.",blacklistArea));
      
        await settings.blacklist.then((blacklist) => blacklistArea.value = blacklist);
      
      
        const regexBlacklistArea = document.createElement("textarea");
        regexBlacklistArea.id = "tags";
        regexBlacklistArea.cols = 80;
        regexBlacklistArea.name = "tags";
        regexBlacklistArea.rows = 6;
        regexBlacklistArea.autocomplete = "off";
        regexBlacklistArea.ariaAutoComplete = "list";
      

        tbody.appendChild(createRow("Regex Tag Blacklist","Any post with a tag containing one of these regular expressions will not be shown (one expression per line, not delimited by slashes). Be careful of trailing whitespace.",regexBlacklistArea));
      
        await settings.regexBlacklist.then((regexes) => regexBlacklistArea.value = regexes);
      
        /**
        const minscoreInput = document.createElement("input");
        minscoreInput.type = "text";
        await settings.minscore.then((score) => minscoreInput.value = score);
        tbody.appendChild(createRow("Minimum Post Score", "Posts with a lower score than this will not be shown (this is the only setting that will cause you to see \"blacklisted\"). May help filter out badly tagged posts.", minscoreInput));
        **/
      
      
        const colorHeader = document.createElement("tr");
        colorHeader.style.textAlign = "center";
        colorHeader.innerHTML = "<td colspan=2><h3>Color Settings</h3></td>";
        tbody.appendChild(colorHeader);
      
      
      
        const bgColorInput = document.createElement("input");
        bgColorInput.type = "text";
        await settings.theme.background.then((col) => bgColorInput.value = col);
        tbody.appendChild(createRow("Background color", "", bgColorInput));
      
        const accentColorInput = document.createElement("input");
        accentColorInput.type = "text";
        await settings.theme.accent.then((col) => accentColorInput.value = col);
        tbody.appendChild(createRow("Accent color", "", accentColorInput));
      
        const linkColorInput = document.createElement("input");
        linkColorInput.type = "text";
        await settings.theme.link.then((col) => linkColorInput.value = col);
        tbody.appendChild(createRow("Default link color", "", linkColorInput));
      
        const copyrightTagColorInput = document.createElement("input");
        copyrightTagColorInput.type = "text";
        await settings.theme.tags.copyright.then((col) => copyrightTagColorInput.value = col);
        tbody.appendChild(createRow("Copyright tag color", "", copyrightTagColorInput));
      
        const characterTagColorInput = document.createElement("input");
        characterTagColorInput.type = "text";
        await settings.theme.tags.character.then((col) => characterTagColorInput.value = col);
        tbody.appendChild(createRow("Character tag color", "", characterTagColorInput));
      
        const artistTagColorInput = document.createElement("input");
        artistTagColorInput.type = "text";
        await settings.theme.tags.artist.then((col) => artistTagColorInput.value = col);
        tbody.appendChild(createRow("Artist tag color", "", artistTagColorInput));
      
        const generalTagColorInput = document.createElement("input");
        generalTagColorInput.type = "text";
        await settings.theme.tags.general.then((col) => generalTagColorInput.value = col);
        tbody.appendChild(createRow("General tag color", "", generalTagColorInput));
      
        const metadataTagColorInput = document.createElement("input");
        metadataTagColorInput.type = "text";
        await settings.theme.tags.metadata.then((col) => metadataTagColorInput.value = col);
        tbody.appendChild(createRow("Meta tag color", "", metadataTagColorInput));
      
        const tfoot = document.createElement("tfoot");
        const tfoot_r = document.createElement("tr");
        const tfoot_d = document.createElement("td");
        tfoot_d.colSpan = 2;
        const saveButton = document.createElement("button");
        saveButton.style.padding = "0 0.3em";
        saveButton.innerHTML = "Save";
      
        saveButton.addEventListener("click", function() {
            //array of promises so we can see if it's saved correctly
            const promises = [];
            promises.push(GM.setValue("blacklist",            blacklistArea.value));
            promises.push(GM.setValue("regexBlacklist",       regexBlacklistArea.value));
          //promises.push(GM.setValue("minscore",             minscoreInput.value));
            promises.push(GM.setValue("theme.background",     bgColorInput.value));
            promises.push(GM.setValue("theme.accent",         accentColorInput.value));
            promises.push(GM.setValue("theme.link",           linkColorInput.value));
            promises.push(GM.setValue("theme.tags.copyright", copyrightTagColorInput.value));
            promises.push(GM.setValue("theme.tags.character", characterTagColorInput.value));
            promises.push(GM.setValue("theme.tags.artist",    artistTagColorInput.value));
            promises.push(GM.setValue("theme.tags.general",   generalTagColorInput.value));
            promises.push(GM.setValue("theme.tags.metadata",  metadataTagColorInput.value));
          
            //make sure everything saved
            Promise.all(promises).then(() => {
                notice.style.display = "unset";
                notice.innerHTML = "Saved!";
                applyBlacklist();
            }).catch(() => {
                notice.style.display = "unset";
                notice.innerHTML = "Failed to save";
            });
        });
      
        tfoot_d.appendChild(saveButton);
        tfoot_r.appendChild(tfoot_d);
        tfoot.appendChild(tfoot_r)
        table.appendChild(tfoot);
      
      
      
    });
}



async function generateFavoritesPage() {
  
    //show favorites as currently selected page
    const navbar = document.getElementById("navbar");
    document.getElementsByClassName("current-page")[0].classList.remove("current-page");
    navbar.children[1].classList.add("current-page");
    navbar.children[0].children[0].addEventListener("click", generateSettingsPage); //reenable settings link if disabled
    navbar.children[1].children[0].removeEventListener("click", generateFavoritesPage);
  
    //hide subnavbar
    document.getElementById("subnavbar").style.display = "none";

  
  
    const content = document.getElementById("content");
  
    const notice = document.getElementById("notice");
  
    //show a blank page while we wait for GetSettings
    content.innerHTML = "";
    notice.style.display = "none";
    //notice.innerHTML = "";
  
  
  
    await GM.getValue("favorites", "[]").then(async (str_favorites) => {
        const favorites = JSON.parse(str_favorites);
        const imageList = document.createElement("div");
        imageList.classList.add("image-list");
      
        for(let favorite of favorites) {
          
            const span = document.createElement("span");
            span.style.alignSelf = "flex-start";
            span.style.display = "grid";
            span.style.gridTemplateRows = "auto 10px";
            span.id = "w" + favorite.id; //give id to wrapper so it can be removed
            const thumb = document.createElement("span");
            thumb.classList.add("thumb");
          
            const a = document.createElement("a");
            a.id = "p" + favorite.id;
            a.href =  "/index.php?page=post&s=view&id=" + favorite.id;
          
            const img = document.createElement("img");
            img.classList.add("preview");
            img.src = favorite.img;
          
            a.appendChild(img);
            thumb.appendChild(a);
            
            const removeButton = document.createElement("a");
            removeButton.href = "#";
            removeButton.innerHTML = "<b>Remove</b>";
            removeButton.addEventListener("click", async () => {
                const index = favorites.findIndex((element) => element.id === favorite.id); //find index of favorite
                favorites.splice(index,1); //remove from favorites
                await GM.setValue("favorites", JSON.stringify(favorites)).then(() => {
                    console.log(favorite.id);
                    document.getElementById("w" + favorite.id).remove(); //remove post from gallery
                });
            });
          
          
            span.appendChild(thumb);
            span.appendChild(document.createElement("br"));
            span.appendChild(removeButton);
          
          
            imageList.appendChild(span);
        };
        content.appendChild(imageList);
    });
  

}


function updateNavbar() {
    const navbar = document.getElementById("navbar");
  
    //change "My account" link to settings page
    const settingsLink = navbar.children[0].children[0];
    settingsLink.innerHTML = "Settings"
    settingsLink.href = "#";
    settingsLink.addEventListener("click", generateSettingsPage);
  
    const favoritesTab = document.createElement("li");
    const favoritesLink = document.createElement("a");
    favoritesLink.innerHTML = "Favorites";
    favoritesLink.href = "#";
    favoritesLink.addEventListener("click", generateFavoritesPage);
    favoritesTab.appendChild(favoritesLink);
    navbar.insertBefore(favoritesTab, navbar.children[1]);
}

//change blacklist cookie
async function applyBlacklist() {

    await GM.getValue("blacklist", "").then((blacklist) => {
        //remove comments, line breaks, and replace several spaces in a row with just a single space
        const compiled_blacklist = blacklist
            .replaceAll(/^#.*$/mg, " ") //remove comments
            .replaceAll("\n", " ")      //remove linebreaks
            .replaceAll(/\s+/g, ' ')    //replcae multiple consecutive spaces with just one
            .trim();
        document.cookie = "tag_blacklist=" + encodeURI(encodeURI(compiled_blacklist));
    });
}


async function applyRegexBlacklist() {
    await GM.getValue("regexBlacklist", "").then((blacklist) => {
        const images = document.getElementsByClassName("image-list")[0].children;
        let blacklisted_regexes = [];
        blacklist.replaceAll(/^#.*$/mg, "").replaceAll(/\n{2,}/g,"\n").split("\n").forEach((entry) => {
            if(entry != "")
                blacklisted_regexes.push(new RegExp(entry));
        });
        for(let image of images) {
            const tags = image.children[0].children[0].alt.trim().split(" ");
            tags.forEach((tag) => {
                for(let regex of blacklisted_regexes) {
                    if(regex.test(tag)) {
                        console.log("Tag " + tag + " blacklisted by regex " + regex);
                        image.style.display = "none";
                        continue;
                    }
                };
            });
        }
    });

}



function updatePostView() {
    //hide comments
    document.getElementById("comment-list").style.display = "none";
    document.getElementById("paginator").style.display = "none";
  
    //hide edit and respond options
    document.getElementsByClassName("image-sublinks")[0].style.display = "none";
  
    const options = document.getElementsByClassName("link-list")[0].children[1].children;
  
    //remove options that require login
    options[0].style.display = "none";
    options[options.length - 2].style.display = "none";
  
  
    const favoriteAdder = options[options.length - 1].children[0];
    favoriteAdder.setAttribute( "onclick", "javascript: void(0);" );
    favoriteAdder.addEventListener("click", async function() {
        await GM.getValue("favorites", "[]").then(async (str_favorites) => {
            const favorites = JSON.parse(str_favorites);
          
            const id = Number(url.searchParams.get("id"));
            const img = "https://rule34.xxx" + new URL(document.querySelector('meta[property="og:image"]').content).pathname;
          
            const item      = {id: id, img: img};
          
          
            const favorite_ids = [];
            for(let favorite of favorites) {
                favorite_ids.push(favorite.id);
            }
          
            const notice = document.getElementById("notice");
            if(favorite_ids.includes(id)) {
                notice.style.display = "unset";
                notice.innerHTML = "Post already in your favorites";
            } else {
                await GM.setValue("favorites", JSON.stringify(favorites.concat(item))).then(() => {
                    notice.style.display = "unset";
                    notice.innerHTML = "Post added to favorites";
                }).catch(() => {
                    notice.style.display = "unset";
                    notice.innerHTML = "Failed to add post to favorites";
                });
            
            }
        });
    });
  
    

}




const url = new URL(window.location.href);

if(url.hostname === "rule34.xxx") {
    applyTheme();
    applyBlacklist();
    if(url.searchParams.get("page") != null) {
        updateNavbar();
        if(url.searchParams.get("page") === "post" && url.searchParams.get("s") === "list") {
            applyRegexBlacklist();
        }
        if(url.searchParams.get("page") === "post" && url.searchParams.get("s") === "view") {
            updatePostView();
        }
    } else {
        //if on main page, remove "my account" tab
        document.getElementById("links").children[3].style.display = "none";
    }
}
