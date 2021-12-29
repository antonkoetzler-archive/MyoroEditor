// Main function for auto-indentation and other functionality
function lint(textarea)
{
  var tabInUse = document.getElementById(currentTab);
  // Adding the keypress to the tab's name attribute
  tabInUse.value = textarea.value;

  switch (event.key)
  {
    case "Tab":
      event.preventDefault();
      textarea.setRangeText("  ");
      textarea.setSelectionRange(
        textarea.selectionStart + 2,
        textarea.selectionStart + 2
      );
      break;
    case "Enter":
      event.preventDefault();
      indent(textarea);
      break;
    case "{":
      event.preventDefault();
      textarea.setRangeText("{\n  \n}");

      // Placing cursor in between the brackets
      textarea.setSelectionRange(
        textarea.selectionStart + 4,
        textarea.selectionStart + 4
      );
      break;
  }
}

// Intent based on the previous line's indent
function indent(textarea)
{
  // Index 0 of text until where the text cursor is
  var text = textarea.value.substr(0, textarea.selectionStart);

  // Getting the start of the current line
  var newlineCheck;
  while (true)
  {
    if (text === "") break;
    
    newlineCheck = text[text.length - 1].match(/\n/g);

    if (newlineCheck == null)
      text = text.substr(0, text.length - 1);
    else
      break;
  }

  // Getting the amount of spaces for indentation
  var startOfLineIndex = text.length;
  var spaces = "";
  while (textarea.value[startOfLineIndex] == " ")
  {
    spaces += " ";
    startOfLineIndex++;
  }

  // Putting the indent on the screen
  textarea.setRangeText("\n" + spaces);
  textarea.setSelectionRange(
    textarea.selectionStart + spaces.length + 1,
    textarea.selectionStart + spaces.length + 1
  );

  // Indent if we expect that a statement's block of code will be written
  // i.e. indent after Python if ...: or C++ if ()
  // Getting the keyword
  var keyword = "";
  while (startOfLineIndex <= textarea.value.length - 1)
  {
    // Current character we're looking at
    var currentCharacter = textarea.value[startOfLineIndex];
    if (currentCharacter != " " && currentCharacter != "(" && currentCharacter.match(/\n/g) == null)
    {
      keyword += currentCharacter;
      startOfLineIndex++;
    }
    else
      break;
  }
  
  var keywords = ["if", "while", "for"];
  if (keywords.includes(keyword))
  {
    textarea.setRangeText("  ");
    textarea.setSelectionRange(
      textarea.selectionStart + 2,
      textarea.selectionStart + 2
    );
  }
}
