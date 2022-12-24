import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;
//Loader to load the ... while the ai is searching 
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element.textContent += '.';

      // If the loading indicator has reached three dots, reset it
      if (element.textContent === '....') {
          element.textContent = '';
      }
  }, 300);
}

//

function typeText(element, text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    } else{
      clearInterval(interval);
    }
  },20)
}

//Creating uniq id with using date and time which is almost unique plus using a random number using math and also creating a hexadec string of 16 character
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
      `
      <div class="wrapper ${isAi && 'ai'}">
          <div class="chat">
              <div class="profile">
                  <img 
                    src=${isAi ? bot : user} 
                    alt="${isAi ? 'bot' : 'user'}" 
                  />
              </div>
              <div class="message" id=${uniqueId}>${value}</div>
          </div>
      </div>
  `
  )
}

const handleSubmit = async (e) => {
  //to prevent the default behavoir of browser
  e.preventDefault();

  const data = new FormData(form);

  //user's chatstripe

  chatContainer.innerHTML += chatStripe(false,data.get('prompt'));
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true,"", uniqueId);
//Scrolling according to new chats automatically
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetvh data from server -> bots response
  const response = await fetch("http://localhost:5000/" , {
    method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
  
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong" ;

    alert(err);
  }

}

form.addEventListener('submit' , handleSubmit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13) {//13 is the enter key 
  handleSubmit(e);
  }
})