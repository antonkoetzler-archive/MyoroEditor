Neutralino.init();

function disableAllMenubarIconDropdowns()
{
  var menubarIconDropdowns = document.getElementsByClassName("menubarIconDropdown");
  for (var i = 0; i < menubarIconDropdowns.length; i++)
    menubarIconDropdowns[i].style.display = "none";
}

function openMenubarIconDropdown(menubarIconDropdown)
{
  var dropdown = document.getElementById(menubarIconDropdown);

  // Checking if this menubarIconDropdown object is already set to display: block
  if (window.getComputedStyle(dropdown).display == "block")
  {
    disableAllMenubarIconDropdowns();
    return;
  }

  disableAllMenubarIconDropdowns();
  dropdown.style.display = "block";
}

function toggleSidebar()
{
  var sidebar = document.getElementById("sidebar");

  if (window.getComputedStyle(sidebar).display == "none")
    document.getElementById("sidebar").style.display = "block";
  else
    document.getElementById("sidebar").style.display = "none";
}

// Zoom in/out
function zoom(key)
{
  var currentFontSize = window.getComputedStyle(document.getElementById("text")).fontSize;

  // Parsing the "px" so we can increase the font size
  var newFontSize = currentFontSize.substr(0, currentFontSize.length - 2);


  if (key === "=") newFontSize++;
  else newFontSize--;

  // Placing the "px" back
  newFontSize += "px";
  // Setting the new font size
  document.getElementById("text").style.fontSize = newFontSize;
}

async function toggleDirectoryContainer()
{
  var directoryContainer = document.getElementById("directoryContainer");
  if (window.getComputedStyle(directoryContainer).display == "none")
    directoryContainer.style.display = "block";
  else
    directoryContainer.style.display = "none";

  document.getElementById("directoryName").focus();
}

async function openDirectory()
{
  let directory = document.getElementById("directoryName").value;
  if (directory[directory.length - 1] != "/") directory += "/";
  let entries = null;

  document.getElementById("directoryContainer").style.display = "none";

  try { entries = await Neutralino.filesystem.readDirectory(directory); }
  catch (error)
  {
    // Enable all items again so the user can re-enter directory
    document.getElementById("directoryName").value = "";
    document.getElementById("directoryName").placeholder = "Enter a valid directory";
    document.getElementById("directoryContainer").style.display = "block";
    return;
  }
  
  document.getElementById("sidebar").style.display = "block";
  // Clearing all previous files shown on the sidebar
  document.getElementById("sidebar").innerHTML = "";

  for (var i = 0; i < entries.length; i++)
  {
    if (entries[i].type != "DIRECTORY")
    {
      var liObject = document.createElement("li");

      if (entries[i].entry.length > 19)
      {
        let parsedEntry = entries[i].entry.substr(0, 16);
        parsedEntry += "...";
        var liObjectTextNode = document.createTextNode(parsedEntry);
      }
      else
        var liObjectTextNode = document.createTextNode(entries[i].entry);
      liObject.appendChild(liObjectTextNode);

      // Saving the directory of the file as the id
      liObject.setAttribute("id", directory + entries[i].entry);

      liObject.setAttribute("onclick", "openSidebarFile(this.id)");

      document.getElementById("sidebar").appendChild(liObject);
    }
  }
}

function openDirEnterPress() { if (event.key === "Enter") openDirectory(); }

function openFile()
{
  // <input>
  var inputObject = document.createElement("input");
  inputObject.setAttribute("type", "file");
  inputObject.setAttribute("id", "openFile");
  inputObject.style.display = "none";

  // What happens once inputObject.click(); executes
  inputObject.onchange = function()
  {
    var fileReader = new FileReader();

    // Loading the file to #text
    fileReader.onload = function() { document.getElementById("text").value = fileReader.result; }

    alert(inputObject.files[0]);
    fileReader.readAsText(inputObject.files[0]);
  }

  inputObject.click();
}

// Open file without dialog
async function openSidebarFile(directory)
{
  document.getElementById("text").value = await Neutralino.filesystem.readFile(directory);
}

async function save()
{
  var tabInUse = document.getElementById(currentTab);
  if (tabInUse.name === "")
    saveAs();
  else
  {
    await Neutralino.filesystem.writeFile(tabInUse.name, document.getElementById("text").value);
    removeAsterisk();
  }
}

async function saveAs()
{
  let entry = await Neutralino.os.showSaveDialog("", {
    filters: [
      {name: "Text files", extensions: ["cpp", "cc", "c", "py", "txt"]},
      {name: "Images", extensions: ["jpg", "png"]},
      {name: "All files", extensions: ["*"]}
    ]
  });
  await Neutralino.filesystem.writeFile(entry, document.getElementById("text").value);

  var tabInUse = document.getElementById(currentTab);
  tabInUse.name = entry; // Saving the file name+dir

  // Setting the innerHTML to the file name
  var explodeFileDirectory = entry.split("/");
  tabInUse.innerHTML = explodeFileDirectory[explodeFileDirectory.length - 1];

  removeAsterisk();
}

function addAsterisk()
{
  // Adding * to the start of innerHTML the user knows they gotta save
  if (document.getElementById(currentTab).innerHTML[0] !== "*")
    document.getElementById(currentTab).innerHTML = "*" + document.getElementById(currentTab).innerHTML;
}

function removeAsterisk()
{
  // When a file is saved, the asterisk is removed
  var tabInUse = document.getElementById(currentTab);
  if (tabInUse.innerHTML[0] == "*")
    tabInUse.innerHTML = tabInUse.innerHTML.substr(1, tabInUse.length);
}

function changeTab(btn)
{
  var tabs = document.getElementsByClassName("tab");
  for (var i = 0; i < tabs.length; i++)
  {
    tabs[i].style.background = "none";
    tabs[i].style.color = "#EDE6D6";
  }
  btn.style.background = "#EDE6D6";
  btn.style.color = "#181818";

  // Putting the text on the screen
  document.getElementById("text").value = btn.value;

  // Global tab variable
  currentTab = btn.id;

  document.getElementById("text").focus();
}

function newTab()
{
  // Getting the name for the new 
  // Creating a .tab button
  var newTab = document.createElement("button");
  newTab.innerHTML = "New File";
  newTab.setAttribute("class", "tab");

  // Finding the ID for this tab
  var tabs = document.getElementsByClassName("tab");
  var tabID = "1";
  for (var i = 0; i < tabs.length; i++)
    if (tabID < tabs[i].id)
      tabID = tabs[i].id;
  tabID++;

  newTab.setAttribute("id", tabID);
  newTab.setAttribute("name", "");  // Name of the file
  newTab.setAttribute("value", ""); // Contents of the file
  newTab.setAttribute("onclick", "changeTab(this)");

  // Adding the button to #tabContainer
  document.getElementById("tabContainer").appendChild(newTab);

  changeTab(newTab);
}

function closeTab()
{
  var tabs = document.getElementsByClassName("tab");
  var tabInUse = document.getElementById(currentTab);

  // Case #1
  if (tabs.length === 1)
  {
    tabInUse.remove();
    newTab();
  }
  else
  {
    for (var i = 0; i < tabs.length; i++)
    {
      if (tabs[i].id === tabInUse.id)
      {
        if (i === 0) currentTab = tabs[i + 1].id;
        else currentTab = tabs[i - 1].id;
      }
    }
    tabInUse.remove();
    changeTab(document.getElementById(currentTab));
  }
}

function exit() { Neutralino.app.exit(); }

// GUI Events
Neutralino.events.on("windowClose", exit);

window.addEventListener("click", function()
{
  if (event.target.className !== "menubarIcon")
    disableAllMenubarIconDropdowns();
});

window.addEventListener("keydown", function()
{
  // Zoom in/out
  if (event.ctrlKey)
  {
    switch (event.key.toLowerCase())
    {
      case "=": // Zoom in
        zoom('=');
        break;
      case "-": // Zoom out
        zoom('-');
        break;
      case "q": // Quit
        exit();
      case "o": // Open
        if (!event.shiftKey) openFile();
        break;
      case "s": // Save
        if (!event.shiftKey) save();
        break;
      case "t": // New tab 
        newTab();
        break;
      case "w":
        closeTab();
        break;
    }
    if (event.shiftKey && event.key.toLowerCase() == "s") saveAs();
    else if (event.shiftKey && event.key.toLowerCase() == "o") toggleDirectoryContainer();
  }
  else if (event.altKey)
  {
    if (event.key.toLowerCase() == "s") toggleSidebar();
  }
});
