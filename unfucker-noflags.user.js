// ==UserScript==
// @name         dashboard unfucker (no flags)
// @version      4.2.2
// @description  no more shitty twitter ui for pc
// @author       dragongirlsnout
// @match        https://www.tumblr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tumblr.com
// @downloadURL  https://raw.githubusercontent.com/enchanted-sword/dashboard-unfucker/main/unfucker-noflags.user.js
// @updateURL    https://raw.githubusercontent.com/enchanted-sword/dashboard-unfucker/main/unfucker-noflags.user.js
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.4.min.js
// @run-at       document-start
// ==/UserScript==

/* globals tumblr */

'use strict';
var $ = window.jQuery;
const main = async function () {
  const version = "4.2.2";
  const updateSrc = "https://raw.githubusercontent.com/enchanted-sword/dashboard-unfucker/main/unfucker-noflags.user.js";
  var $ = window.jQuery;
  const match = [
    "",
    "dashboard",
    "settings",
    "blog",
    "domains",
    "search",
    "likes",
    "following",
    "inbox",
    "tagged",
    "explore",
    "reblog"
  ];
  const storageAvailable = (type) => { //thanks mdn web docs!
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException && (
          e.code === 22 ||
          e.code === 1014 ||
          e.name === "QuotaExceededError" ||
          e.name === "NS_ERROR_DOM_QUOTA_REACHED"
        ) &&
          storage &&
          storage.length !== 0
      );
    }
  };
  const waitFor = (selector, retried = 0,) => new Promise((resolve) => {
    if ($(selector).length) {
      resolve()
    } else if (retried < 25) { requestAnimationFrame(() => waitFor(selector, retried + 1).then(resolve)) }
  });
  const updatePreferences = (arr) => localStorage.setItem("configPreferences", JSON.stringify(arr));
  const isDashboard = () => ["dashboard", ""].includes(location.pathname.split("/")[1]);
  const matchPathname = () => match.includes(location.pathname.split("/")[1]);
  const headerFixTarget = () => {
    if (isDashboard() || location.pathname.split("/").some(x => ["messages", "inbox"].includes(x))) return true;
    else return false;
  };
  const getUtilities = async function () {
    let retries = 0;
    while (retries++ < 1000
      && (typeof window.tumblr === "undefined"
      || typeof window.tumblr.getCssMap === "undefined"
      || typeof window.tumblr.languageData === "undefined")) {
        await new Promise((resolve) => setTimeout(resolve));
    }
    const cssMap = await window.tumblr.getCssMap();
    const keyToClasses = (...keys) => keys.flatMap(key => cssMap[key]).filter(Boolean);
    const keyToCss = (...keys) => `:is(${keyToClasses(...keys).map(className => `.${className}`).join(", ")})`;
    const tr = (string) => `${window.tumblr.languageData.translations[string] || string}`
    return { keyToClasses, keyToCss, tr };
  };
      
  getUtilities().then(({ keyToClasses, keyToCss, tr }) => {
    const postSelector = "[tabindex='-1'][data-id] article";
    const newNodes = [];
    const target = document.getElementById("root");
    const $styleElement = $(`
      <style id="__s">
        #__h {
          display: flex;
          margin: auto;
          max-width: 1716px;
          padding: 0 20px 0;
          align-items: center;
          height: 55px;
        }
        #__m { margin-bottom: 20px; }
        #__in {
          padding: 8px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        #__in h1 {
          color: rgb(var(--white-on-dark));
          font-size: 1.2em;
          display: inline;
        }
        #__m ul {
          margin: 4px;
          padding: 0;
          background: RGB(var(--white));
          border-radius: 3px;
        }
        #__m li {
          list-style-type: none;
          padding: 8px 12px;
          border-bottom: 1px solid rgba(var(--black),.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgb(var(--black));
        }
        li.infoHeader {
          background: rgba(var(--black),.07);
          padding: 12px 12px;
          font-weight: bold;
        }
        @media (min-width: 990px) {
          #tumblr {
            --dashboard-tabs-header-height: 0px !important;
            overflow-x: hidden;
          }
          ${keyToCss('reorderButton')} { color: rgba(var(--black),.65); }
          ${keyToCss('subNav')} use { --icon-color-primary: rgba(var(--black),.65) }
          ${keyToCss('heading')} {
            position: sticky;
            top: 0;
            height: 36px;
            width: 240px !important;
            background: RGB(var(--white));
            z-index: 1;
            margin: 0 !important;
            padding: 5px 20px 5px 10px !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: .875rem;
            color: rgba(var(--black),.65) !important;
            line-height: 1.5;
            box-sizing: border-box;
          }
          ${keyToCss('heading')}::before {
            background: rgba(var(--black),.07);
            content: '';
            width: 100%;
            height: 36px;
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
          }
          #account_subnav {
            background: RGB(var(--white));
            color: RGB(var(--black));
            max-height: 90vh;
            width: 240px;
            overflow-y: auto;
            overflow-x: hidden;
            overscroll-behavior: none;
            scrollbar-width: thin;
            scrollbar-color: rgba(var(--black),.4)rgba(var(--white),.1);
            position: fixed;
            top: 48px;
            border-radius: var(--border-radius-small);
            box-shadow: 0 0 15px rgba(0,0,0,.5);
          }
          ${keyToCss('subNav')} a,
          ${keyToCss('subNav')} ${keyToCss('childWrapper')},
          ${keyToCss('subNav')} ${keyToCss('blogName')} { color: RGB(var(--black)) !important; }
          ${keyToCss('subNav')} ${keyToCss('endChildWrapper')},
          ${keyToCss('subNav')} ${keyToCss('count')},
          ${keyToCss('reorderButton')},
          ${keyToCss('navSubHeader')},
          ${keyToCss('subNav')} ${keyToCss('blogTitle')},
          ${keyToCss('navSubHeader')} a {
            color: rgba(var(--black),.65) !important;
            text-decoration: none;
          }
          ${keyToCss('subNav')} use { --icon-color-primary: rgba(var(--black),.65) }
          ${keyToCss("subNav")} > ${keyToCss("navItem")}, ${keyToCss("accountStats")} li {
            list-style-type: none;
          }
          ${keyToCss('subNav')} > ${keyToCss('navItem')}:hover,
          ${keyToCss('accountStats')} li:hover {
            background-color: rgba(var(--black),.07);
          }
          ${keyToCss('subNav')} > li > ul { padding: 0 !important }
          ${keyToCss('navInfo')} ${keyToCss('childWrapper')} {
            display: flex;
            align-items: center;
          }
          ${keyToCss('childWrapper')} > svg {
            margin-right: 10px;
          }
          ${keyToCss('startChildWrapper')} > svg {
            width: 21px !important;
            height: 21px !important;
          }
          ${keyToCss('startChildWrapper')} + ${keyToCss('navInfo')}:not(#account_subnav div) {
            display: none !important;
          }
          ${keyToCss('searchSidebarItem')} {
            max-width: 480px;
            width: 100%;
            z-index: 100;
            height: fit-content;
            padding: 0;
          }
          ${keyToCss('navigationWrapper')} {
            display: none !important;
          }
          ${keyToCss('navigationLinks')} {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            width: 100%;
            margin: 0;
          }
          ${keyToCss('navItem')}${keyToCss('open')} { border: none !important; }
          ${keyToCss('navItem')}:hover { background-color: transparent; }
          ${keyToCss('navItem')}[title='${tr('Home')}'] { order: -9; }
          ${keyToCss('navItem')}[title='${tr('Live')}'] { order: -8; }
          ${keyToCss('navItem')}[title='${tr('Explore')}'] { order: -7; }
          ${keyToCss('navigationLinks')} > ${keyToCss('targetPopoverWrapper')}:nth-of-type(3) { order: -6; }
          ${keyToCss('navItem')}[title='${tr('Inbox')}'] { order: -5; }
          ${keyToCss('navigationLinks')} > ${keyToCss('targetPopoverWrapper')}:nth-of-type(2) { order: -4; }
          ${keyToCss('navigationLinks')} > ${keyToCss('targetPopoverWrapper')}:nth-of-type(1) { order: -3; }
          ${keyToCss('navItem')}[title='${tr('Get a domain')}'] { order: -2 }
          ${keyToCss('navItem')}[title='${tr('Go Ad-Free')}'] { order: -1 }
          ${keyToCss('navigationLinks')} >${keyToCss('navItem')},
          ${keyToCss('navigationLinks')} >${keyToCss('targetPopoverWrapper')} {
            width: 20px;
            margin: 0 16px;
          }
          ${keyToCss('navigationLinks')} > ${keyToCss('navItem')} ${keyToCss('navLink')},
          ${keyToCss('navigationLinks')} > ${keyToCss('targetPopoverWrapper')} ${keyToCss('navLink')} {
            padding: 0;
            gap: 0;
            justify-content: center;
          }
          ${keyToCss('mainContentWrapper')} {
            flex-basis: unset !important;
            width: 100%;
            justify-content: center !important;
          }
          ${keyToCss('mainContentWrapper')} > ${keyToCss('hasBorder')} {
            max-width: unset !important;
            width: 100%;
            display: flex;
            justify-content: center;
          }
          ${keyToCss('main')} {
            margin-right: 16px;
            padding: 0;
            border: none !important;
          }
          ${keyToCss('tabsHeader')} {
            width: 540px;
            margin: 0 !important;
          }
          ${keyToCss("timelineOptions")} { overflow-x: auto !important; }
          ${keyToCss('stickyContainer')} > ${keyToCss('avatar')} { top: calc(69px + var(--dashboard-tabs-header-height, 0px)) !important; }
          ${keyToCss('createPost')} {
            width: 45px;
            margin-left: 10px;
          }
          ${keyToCss('createPostButton')} {
            gap: 0 !important;
            border-radius: var(--border-radius-small) !important;
            font-size: 0px !important;
            max-width: 45px;
            height: 32px;
          }
          ${keyToCss('container')}${keyToCss('mainContentIs4ColumnMasonry')} { margin: 0 auto !important; }
          ${keyToCss("bluespaceLayout")} > ${keyToCss("newDesktopLayout")} { margin-top: 32px; }
          ${keyToCss("reblogRedesignEnabled")} { border-radius: var(--border-radius-small) !important; }
          .__stickyContainer {
            color: RGB(var(--white-on-dark));
            pointer-events: none;
            height: 100%;
            position: absolute;
            left: -85px;
          } 
          .__avatarOuter {
            pointer-events: auto;
            top: calc(69px + var(--dashboard-tabs-header-height,0px));
            transition: top .25s;
            position: -webkit-sticky;
            position: sticky;
          }
          .__avatarWrapper { position: relative; }
          .__blogLink {
            cursor: pointer;
            word-break: break-word;
            text-decoration: none;
          }
          .__targetWrapper {
            width: inherit;
            vertical-align: top;
            display: inline-block;
          }
          .__avatarInner { position: relative; }
          .__avatarWrapperInner {
            border-radius: var(--border-radius-small);
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          .__placeholder {
            width: 100%;
            line-height: 0;
            position: relative;
          }
          .__avatarImage {
            position: absolute;
            top: 0;
            left: 0;
            object-fit: cover;
            visibility: visible;
          }
          .__anonymous {
            background-image: url(/pop/src/assets/images/avatar/anonymous_avatar_40-3af33dc0.png);
            background-size: 100% 100%;
            border-radius: var(--border-radius-small);
          }
        }
      </style>
    `);

    const newAvatar = blog => $(`
      <div class="__stickyContainer" data-testid="sticky-avatar-container">
        <div class="__avatarOuter">
          <div class="__avatarWrapper" role="figure" aria-label="${tr("avatar")}">
            <span data-testid="controlled-popover-wrapper" class="__targetWrapper">
              <span class="__targetWrapper">
                <a href="https://${blog}.tumblr.com/" title="${blog}" target="_blank" rel="noopener" role="link" class="__blogLink" tabindex="0">
                  <div class="__avatarInner" style="width: 64px; height: 64px;">
                    <div class="__avatarWrapperInner">
                      <div class="__placeholder" style="padding-bottom: 100%;">
                        <img
                        class="__avatarImage"
                        src="https://api.tumblr.com/v2/blog/${blog}/avatar"
                        sizes="64px" 
                        alt="${tr("Avatar")}" 
                        style="width: 64px; height: 64px;" 
                        loading="eager">
                      </div>
                    </div>
                  </div>
                </a>
              </span>
            </span>
          </div>
        </div>
      </div>
    `);
    const ownAvatar = ownName => $(`
      <div class="__avatarOuter" style="position: absolute; top: 0; left: -85px;">
        <div class="__avatarWrapper" role="figure" aria-label="${tr("avatar")}">
          <span data-testid="controlled-popover-wrapper" class="__targetWrapper">
            <span class="__targetWrapper">
              <a href="https://${ownName}.tumblr.com/" title="${ownName}" target="_blank" rel="noopener" role="link" class="blogLink" tabindex="0">
                <div class="__avatarInner" style="width: 64px; height: 64px;">
                  <div class="__avatarWrapperInner">
                    <div class="__placeholder" style="padding-bottom: 100%;">
                      <img
                      class="__avatarImage"
                      src="https://api.tumblr.com/v2/blog/${ownName}/avatar"
                      sizes="64px" 
                      alt="${tr("Avatar")}" 
                      style="width: 64px; height: 64px;" 
                      loading="eager">
                    </div>
                  </div>
                </div>
              </a>
            </span>
          </span>
        </div>
      </div>
    `);
    const fixHeader = posts => {
      for (const post of posts) {
        let $post = $(post);
        let $header = $post.find(`header${keyToCss("header")}`);
        let parent = "";
        if (location.pathname.split("/").includes("inbox")
          || location.pathname.split("/").includes("messages")) {
          parent = $header.find(keyToCss("blogLink")).eq(1).text()
            || "anon";
        } else {
          parent = $header.find(keyToCss("blogLink")).eq(0).text()
          || $post.find(`[aria-label="${tr("Reblog")}"]`)?.attr("href").split("/")[2];
        }
        if ($header.find(keyToCss("rebloggedFromName")).length) {
          $header.find(keyToCss("reblogged")).hide();
          let $rebloggedFrom = $header.find(keyToCss("rebloggedFromName"));
          let $reblogIcon = $header.find(keyToCss("reblogIcon"));
          $reblogIcon.css("margin-left", "2px");
          $reblogIcon.insertBefore($rebloggedFrom);
          $rebloggedFrom.css("margin-left", "5px");
        } else if ($header.find(keyToCss("avatar")).length) {
          $header.find(keyToCss("avatar")).hide();
        } else {
          $header.find(keyToCss("reblogged")).hide();
          let $reblogIcon = $header.find(keyToCss("reblogIcon"));
          $reblogIcon.css("margin-left", "2px");
          $reblogIcon.appendTo($header.find(keyToCss("attribution")));
          $header.find($(keyToCss("followButton"))).eq(0).hide();
          let $label = $post.find(keyToCss("label")).eq(0).clone();
          $label.insertAfter($reblogIcon);
          $label.css({display: "inline", marginLeft: "5px"});
          $label.find(keyToCss("attribution")).css("color", "rgba(var(--black),.65)");
        }
        if (parent !== "anon") $post.prepend(newAvatar(parent));
        else {
          $header.find(keyToCss("attribution")).css("font-weight", "bold");
          $post.prepend(
            $(`
              <div class="__stickyContainer" data-testid="sticky-avatar-container">
                <div class="__avatarOuter">
                  <figure class="__anonymous" aria-label="${tr("Anonymous avatar")}" style="width: 64px; height: 64px;"></figure>
                </div>
              </div>
            `)
          );
        }
      }
    };
    const sortPosts = () => {
      const nodes = newNodes.splice(0);
      if (nodes.length !== 0 && (nodes.some(node => node.matches(postSelector) || node.querySelector(postSelector) !== null))) {
        const posts = [
          ...nodes.filter(node => node.matches(postSelector)),
          ...nodes.flatMap(node => [...node.querySelectorAll(postSelector)])
        ].filter((value, index, array) => index === array.indexOf(value));
        fixHeader(posts);
      }
      else return
    };
    const observer = new MutationObserver(mutations => {
      const nodes = mutations
        .flatMap(({ addedNodes }) => [...addedNodes])
        .filter(node => node instanceof Element)
        .filter(node => node.isConnected);
      newNodes.push(...nodes);
      sortPosts();
    });
    const newSearch = () => $(`
      <div class="${keyToClasses("searchSidebarItem").join(" ")}" style="max-width: 550px; width: 100%;" >
        <div class="${keyToClasses("formContainer").join(" ")}">
          <span data-testid="controlled-popover-wrapper" class="${keyToClasses("targetWrapper").join(" ")}">
            <span class="${keyToClasses("targetWrapper").join(" ")}">
              <form method="GET" action="/search" role="search" class="${keyToClasses("form").join(" ")}">
                <div class="${keyToClasses("searchbarContainer").join(" ")}">
                  <div class="${keyToClasses("searchIcon").join(" ")}">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" role="presentation" >
                      <use href="#managed-icon__search"></use>
                    </svg>
                  </div>
                  <input
                    name="q"
                    type="text"
                    autocomplete="off"
                    aria-label="${tr("Search")}"
                    class="${keyToClasses("searchbar").join(" ")}"
                    placeholder="Search Tumblr"
                    autocapitalize="sentences"
                    value=""
                  />
                </div>
              </form>
            </span>
          </span>
        </div>
      </div>
    `);
    const newSettings = () => $(` 
      <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
        <button class="${keyToClasses("button")[0]} ${keyToClasses("navLinkButtonWrapper").join(" ")}">
          <span class="${keyToClasses("buttonInner").join(" ")} ${keyToClasses("navLink").join(" ")}" tabindex="-1" style="width: 100%;">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" role="presentation">
              <use href="#managed-icon__settings"></use>
            </svg>
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}" style="font-size: 1rem;">${tr("Settings")}</span>
              <span class="${keyToClasses("buttonInner").join(" ")} ${keyToClasses("caret").join(" ")}" id="settings_caret" style="transition: transform 200ms ease-in-out 0s;">
                <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" role="presentation">
                  <use href="#managed-icon__caret-thin"></use>
                </svg>
              </span>
            </div>
          </span>
        </button>
      </li>
    `);
    const settingsSubmenu = () => $(`
      <ul class="${keyToClasses("accountStats").join(" ")}" id="settings_submenu_new" style="margin: 0;">
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/account">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Account")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/dashboard">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Dashboard")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/notifications">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Notifications")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/domains">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Domains")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/ad-free-browsing">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Ad-Free Browsing")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/purchases">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Payment &amp; purchases")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/subscriptions">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Post+ subscriptions")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/apps">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Apps")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/privacy">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Privacy")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/labs">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Labs")}</span>
            </div>
          </a>
        </li>
        <li class="${keyToClasses("navItem").join(" ")} ${keyToClasses("newDesktopLayout").join(" ")}">
          <a class="${keyToClasses("navLink").join(" ")}" href="/settings/gifts">
            <div class="${keyToClasses("navInfo").join(" ")}">
              <span class="${keyToClasses("childWrapper").join(" ")}">${tr("Gifts")}</span>
            </div>
          </a>
        </li>
      </ul>
    `);
    const newCaret = () => $(`
      <button class="${keyToClasses("button")[0]}" aria-label="${tr("Show Blog Statistics")}">
        <span class="${keyToClasses("buttonInner").join(" ")} ${keyToClasses("menuTarget").join(" ")}" style="transform: rotate(0deg); display: flex; transition: transform 200ms ease-in-out 0s;" tabindex="-1">
          <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" role="presentation">
            <use href="#managed-icon__caret-thin"></use>
          </svg>
        </span>
      </button>
    `);
    const accountStats = blog => $(`
      <ul class="${keyToClasses("accountStats").join(" ")}">
        <li>
          <a href="/blog/${blog.name}">
            <span>${tr("Posts")}</span>
            <span class="${keyToClasses("count")[3]}">${blog.posts ? blog.posts : ""}</span>
          </a>
        </li>
        <li>
          <a href="/blog/${blog.name}/followers">
            <span>${tr("Followers")}</span>
            <span class="${keyToClasses("count")[3]}">${blog.followers ? blog.followers : ""}</span>
          </a>
        </li>
        <li id="__${blog.name}-activity">
          <a href="/blog/${blog.name}/activity">
            
          </a>
        </li>
        <li>
          <a href="/blog/${blog.name}/drafts">
            <span>${tr("Drafts")}</span>
            <span class="${keyToClasses("count")[3]}">${blog.drafts ? blog.drafts : ""}</span>
          </a>
        </li>
        <li>
          <a href="/blog/${blog.name}/queue">
            <span>${tr("Queue")}</span>
            <span class="${keyToClasses("count")[3]}">${blog.queue ? blog.queue : ""}</span>
          </a>
        </li>
        <li>
          <a href="/blog/${blog.name}/post-plus">
            <span>${tr("Post+")}</span>
          </a>
        </li>
        <li>
          <a href="/blog/${blog.name}/blaze">
            <span>${tr("Tumblr Blaze")}</span>
          </a>
        </li>
        <li>
          <a href="/settings/blog/${blog.name}">
            <span>${tr("Blog settings")}</span>
          </a>
        </li>
        <li>
          <a href="/mega-editor/published/${blog.name}" target="_blank">
            <span>${tr("Mass Post Editor")}</span>
          </a>
        </li>
      </ul>
    `);
    const checkboxEvent = (id, value) => {
      switch (id) {
        case "__c1":
        $(keyToCss("timelineHeader")).toggle(!value);
        break;
        case "__c2":
        $(keyToCss("sidebarItem")).has(keyToCss("recommendedBlogs")).toggle(!value);
        break;
        case "__c3":
        $(keyToCss("sidebarItem")).has(keyToCss("radar")).toggle(!value);
        break;
        case "__c4":
        $(keyToCss("navItem")).has('use[href="#managed-icon__explore"]').toggle(!value);
        break;
        case "__c5":
        $(keyToCss("navItem")).has('use[href="#managed-icon__shop"]').toggle(!value);
        break;
        case "__c6":
        $(keyToCss("navItem")).has('use[href="#managed-icon__live-video"]')
        .add($(keyToCss("navItem")).has('use[href="#managed-icon__coins"]'))
        .add($(keyToCss("listTimelineObject")).has(keyToCss("liveMarqueeTitle")))
        .toggle(!value);
        break;
        case "__c7":
        $(keyToCss("navItem")).has('use[href="#managed-icon__earth"]').toggle(!value);
        break;
        case "__c8":
        $(keyToCss("navItem")).has('use[href="#managed-icon__sparkle"]').toggle(!value);
        break;
        case "__c10":
        value? observer.observe(target, { childList: true, subtree: true })
        : observer.disconnect();
        break;
        default:
        console.error("checkboxEvent: invalid id");
      }
    };
    const initialChecks = () => {
      if ($("#__m").length) { //initial status checks to determine whether to inject or not
        console.log("no need to unfuck");
        return false;
      } else if (!$(keyToCss("navigationLinks")).length) {
        console.error("page not loaded, retrying...");
        throw "page not loaded";
        return false;
      } else {
        console.log("unfucking dashboard...");
        return true;
      };
    };
    const followingAsDefault = async function () {
      waitFor($(keyToCss("timeline"))).then(() => {
        if (isDashboard()
          && $(keyToCss("timeline")).attr("data-timeline").split("?")[0] === "/v2/tabs/for_you") {
          window.tumblr.navigate("/dashboard/following");
          console.log("navigating to following");
          throw "navigating tabs";
        } else if (isDashboard) {
          waitFor(keyToCss("timelineOptionsItemWrapper")).then(() => {
            if ($(keyToCss("timelineOptionsItemWrapper")).first().has("a[href='/dashboard/stuff_for_you']").length) {
              let $forYou = $(keyToCss("timelineOptionsItemWrapper")).has("a[href='/dashboard/stuff_for_you']");
              let $following = $(keyToCss("timelineOptionsItemWrapper")).has("a[href='/dashboard/following']");
              $following.insertBefore($forYou);
            }
          });
        }
      });
    };
    const getPreferences = () => {
      let preferences = [
        { type: "checkbox", value: "" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "checkbox", value: "checked" },
        { type: "range", value: "100" },
        { type: "checkbox", value: "checked" }
      ];
      if (storageAvailable("localStorage")) {
        if (!localStorage.getItem("configPreferences")
        || JSON.parse(localStorage.getItem("configPreferences")).length < 10) {
          updatePreferences(preferences)
        } else { preferences = JSON.parse(localStorage.getItem("configPreferences")); }
      };
      return preferences;
    };
    const configMenu = (version, updateSrc, pref) => $(`
      <div id="__m">
        <div id="__in">
          <h1>dashboard unfucker v${version}b</h1>
          <button id="__ab">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" role="presentation" style="--icon-color-primary: rgba(var(--white-on-dark), 0.65);">
              <use href="#managed-icon__ellipsis"></use>
            </svg>
          </button>
          <button id="__cb">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" role="presentation" style="--icon-color-primary: rgba(var(--white-on-dark), 0.65);">
              <use href="#managed-icon__settings"></use>
            </svg>
          </button>
        </div>
        <div id="__a" style="display: none;">
          <ul id="__am">
            <li class="infoHeader">
              <span>about</span>
            </li>
            <li style="flex-flow: column wrap">
              <span style="width: 100%;">version: <b>v${version}b</b></span><br>
              <span style="width: 100%;">type "<b>b</b>" uses jQuery instead of window property feature toggles</span>
            </li>
            <li>
              <a target="_blank" href="https://github.com/enchanted-sword/dashboard-unfucker">source</a>
            </li>
            <li>
              <a target="_blank" href="https://github.com/enchanted-sword/dashboard-unfucker/issues/new?labels=bug&projects=&template=bug_report.md&title=">report a bug</a>
            </li>
            <li>
              <a target="_blank" href="${updateSrc}">update</a>
            </li>
            <li>
              <a target="_blank" href="https://tumblr.com/dragongirlsnout">my tumblr!</a>
            </li>
            <li>
              <a target="_blank" href="https://www.paypal.com/paypalme/dragongirled">support my work!</a>
            </li>
          </ul>
        </div>
        <div id="__c" style="display: none;">
          <ul id="__ct">
            <li class="infoHeader">
              <span>general configuration</span>
            </li>
            <li>
              <span>hide dashboard tabs</span>
              <input class="configInput" type="checkbox" id="__c1" name="0" ${pref[0].value}>
            </li>
            <li>
              <span>hide recommended blogs</span>
              <input class="configInput" type="checkbox" id="__c2" name="1" ${pref[1].value}>
            </li>
            <li>
              <span>hide tumblr radar</span>
              <input class="configInput" type="checkbox" id="__c3" name="2" ${pref[2].value}>
            </li>
            <li>
              <span>hide explore</span>
              <input class="configInput" type="checkbox" id="__c4" name="3" ${pref[3].value}>
            </li>
            <li>
              <span>hide tumblr shop</span>
              <input class="configInput" type="checkbox" id="__c5" name="4" ${pref[4].value}>
            </li>
            <li>
              <span>hide tumblr live</span>
              <input class="configInput" type="checkbox" id="__c6" name="5" ${pref[5].value}>
            </li>
            <li>
              <span>hide domains</span>
              <input class="configInput" type="checkbox" id="__c7" name="6" ${pref[6].value}>
            </li>
            <li>
              <span>hide ad-free</span>
              <input class="configInput" type="checkbox" id="__c8" name="7" ${pref[7].value}>
            </li>
            <li>
              <span>content positioning</span>
              <input class="configInput" type="range" id="__c9" name="8" min="-500" max="500" step="1" value="${pref[8].value}">
            </li>
            <li>
              <span>revert post header changes</span>
              <input class="configInput" type="checkbox" id="__c10" name="9" ${pref[9].value}>
            </li>
          </ul>
        </div>
      </div>
    `);
    const initializePreferences = (pref, pathname) => {
      const $timelineHeader = $(keyToCss("timelineHeader"));
      const $navItems = $(keyToCss("navigationLinks")).children();
      const $main = $(keyToCss("main"));

      $timelineHeader.toggle(!pref[0].value);
      waitFor(keyToCss("recommendedBlogs")).then(() => {
        $(keyToCss("sidebarItem")).has(keyToCss("recommendedBlogs")).toggle(!pref[1].value);
      });
      waitFor(keyToCss("radar")).then(() => {
        $(keyToCss("sidebarItem")).has(keyToCss("radar")).toggle(!pref[2].value);
      });
      $navItems.has('use[href="#managed-icon__explore"]').toggle(!pref[3].value);
      $navItems.has('use[href="#managed-icon__shop"]').toggle(!pref[4].value);
      $navItems.has('use[href="#managed-icon__live-video"]')
        .add($navItems.has('use[href="#managed-icon__coins"]'))
        .add($(keyToCss("listTimelineObject"))
        .has(keyToCss("liveMarqueeTitle"))).toggle(!pref[5].value);
      $navItems.has('use[href="#managed-icon__earth"]').toggle(!pref[6].value);
      $navItems.has('use[href="#managed-icon__sparkle"]').toggle(!pref[7].value);
      if ($main.length 
        && matchPathname() 
        && !["search", "tagged"].includes(pathname)) {
        $main.css("margin-left", `${pref[8].value}px`);
      } 
      if (pref[9].value && headerFixTarget()) {
        fixHeader($(postSelector));
        observer.observe(target, { childList: true, subtree: true });
      } else observer.disconnect;
    };
    const addAccountStats = blogs => {
      const $blogs = $(keyToCss("blogTile"));
      for (let i = 0; i < blogs.length; ++i) {
        const $blog = $blogs.eq(i);
        const blog = blogs[i];
        const $button = newCaret();
        $blog.find(keyToCss("actionButtons")).append($button);
        const $accountStats = accountStats(blog);
        $accountStats.insertAfter($blog);
        if (blog.isGroupChannel) {
          var $members = $(`
            <li>
              <a href="/blog/${blog.name}/members" target="_blank">
                <span>${tr("Members")}</span>
              </a>
            </li>
          `);
          $members.insertAfter($(`#__${blog.name}-activity`));
        }
        $accountStats.hide()
        $button.on("click", function () {
          if ($(keyToCss("accountStats")).eq(i + 1).is(":hidden")) {
            $(this).css("transform", "rotate(180deg)");
          }
          else {
            $(this).css("transform", "rotate(0deg)");
          }
          $(keyToCss("accountStats")).eq(i + 1).toggle();
        });
      }
    };
    const reorderPage = (ownName, pathname, blogs, $menu) => {
      let $content = {};
      const $navigationLinks = $(keyToCss("navigationLinks"));
      const $headerWrapper = $("<nav>", { class: keyToClasses("headerWrapper").join(" "), id: "__hw" });
      const $header = $("<header>", { id: "__h" });
      const $logoContainer = $(keyToCss("logoContainer"));
      const $createPost = $(keyToCss("createPost"));
      const $heading = $(`<div class="${keyToClasses("heading").join(" ")}"><h3>Account</h3></div>`);
      const $likeIcon = $(`<svg xmlns="http://www.w3.org/2000/svg" height="18" width="20" role="presentation" style="--icon-color-primary: rgba(var(--black), 0.65);"><use href="#managed-icon__like-filled"></use></svg>`);
      const $followingIcon = $(`<svg xmlns="http://www.w3.org/2000/svg" height="21" width="20" role="presentation" style="--icon-color-primary: rgba(var(--black), 0.65);"><use href="#managed-icon__following"></use></svg>`);
      const $settings = newSettings();
      const $settingsSubmenu = settingsSubmenu();
      const $subnav = $("#account_subnav");
      const $bar = $(`${keyToCss("postColumn")} > ${keyToCss("bar")}`);
      const $bluespaceLayout = $(keyToCss("bluespaceLayout"));
      const $navSubHeader = $(keyToCss("navSubHeader"));
      const $tabsHeader = $(keyToCss("tabsHeader"));

      addAccountStats(blogs);
      if (matchPathname()) {
        $tabsHeader.insertAfter($bar);
        $content = $(keyToCss("main"));
        waitFor(keyToCss("sidebar")).then(() => {
          $(keyToCss("sidebar")).prepend($menu);
          let $search = $(keyToCss("searchSidebarItem"));
          $search.insertAfter($logoContainer);
        });
      } else {
        $content = $(`${keyToCss("mainContentWrapper")} ${keyToCss("container")}`);
        $("#__h").append(newSearch());
      };
      if (["search", "tagged"].includes(pathname)) {
        $content.css("max-width", "fit-content");
      };
      $bar.prepend(ownAvatar(ownName));
      $bluespaceLayout.prepend($headerWrapper);
      $headerWrapper.append($header)
      $header.append($logoContainer);
      $header.append($navigationLinks);
      $header.append($createPost);
      $navSubHeader.addClass(keyToClasses("heading").join(" "));
      $subnav.prepend($heading);
      $heading.append($(keyToCss("logoutButton")));
      $(`[href="/likes"] ${keyToCss("childWrapper")}`).prepend($likeIcon);
      $(`[href="/following"] ${keyToCss("childWrapper")}`).prepend($followingIcon);
      $settings.insertAfter($(keyToCss("navItem")).has("span:contains('Following')"));
      $settingsSubmenu.insertAfter($settings);
      $settingsSubmenu.hide();
      $settings.on("click", () => {
        if ($settingsSubmenu.is(":hidden")) {
          $("#settings_caret").css("transform", "rotate(180deg)");
        }
        else { $("#settings_caret").css("transform", "rotate(0deg)") }
        $settingsSubmenu.toggle();
      });
      $(`[title="${tr("Settings")}"]`).hide();
      $(document).on("click", () => {
        if (!$(`${keyToCss("subNav")}:hover`).length
          && !$subnav.eq(0).attr("hidden")) {
          try { document.getElementById("account_button").click(); }
          catch { throw "element not loaded"}
        };
      });
      $(`button[aria-label="${tr("Show Blog Statistics")}"`).eq(0).trigger("click");
    }
    const unfuck = async function () {
      if (!initialChecks()) return;

      let configPreferences = getPreferences();
      const pathname = location.pathname.split("/")[1];
      const ownName = $("#account_subnav").find($(keyToCss("displayName"))).eq(0).text();
      const blogs = window.___INITIAL_STATE___.queries.queries[0].state.data.user.blogs;
      const $menu = configMenu(version, updateSrc, configPreferences);

      $("html").append($menu);
      $("#__cb").on("click", () => {
        if ($("#__c").is(":hidden")) {
          $("#__cb svg").css("--icon-color-primary", "rgb(var(--white-on-dark))");
        } else { $("#__cb svg").css("--icon-color-primary", "rgba(var(--white-on-dark),.65)") }
        $("#__c").toggle();
      });
      $("#__ab").on("click", () => {
        if ($("#__a").is(":hidden")) {
          $("#__ab svg").css("--icon-color-primary", "rgb(var(--white-on-dark))");
        } else { $("#__ab svg").css("--icon-color-primary", "rgba(var(--white-on-dark),.65)") }
        $("#__a").toggle();
      });
      $(".configInput").on("change", function () {
        if ($(this).attr("type") === "checkbox") {
          configPreferences[Number($(this).attr("name"))].value = $(this).is(":checked") ? "checked" : "";
          checkboxEvent($(this).attr("id"), $(this).is(":checked"));
        }
        else {
          configPreferences[Number($(this).attr("name"))].value = $(this).val();
          if ($(keyToCss("main")).length && !["search", "tagged"].includes(pathname)) {
            $(keyToCss("main")).css("margin-left", `${$(this).val()}px`);
          };
        };
        updatePreferences(configPreferences);
      });
      requestAnimationFrame(() => {
        followingAsDefault();
        initializePreferences(configPreferences, pathname);
        reorderPage(ownName, pathname, blogs, $menu);
        $styleElement.appendTo("html");
      });
      console.log("dashboard fixed!");
    };

    unfuck();
    window.tumblr.on('navigation', () => window.setTimeout(
      unfuck().then(() => {
        window.setTimeout(() => {
          if (!$("#__hw").length) unfuck();
        }, 400)
      }).catch((e) => 
        window.setTimeout(unfuck, 400)
      ), 400
    ));
  });
};
const { nonce } = [...document.scripts].find(script => script.getAttributeNames().includes("nonce")) || "";
const script = $(`
  <script nonce="${nonce}">
    const unfuckDashboard = ${main.toString()};
    unfuckDashboard();
  </script>
`);
$("head").append(script);