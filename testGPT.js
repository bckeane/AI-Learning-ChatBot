import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
});


var chatResponse ='';
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

console.log("1", completion)
    chatResponse = completion.choices[0].message.content.trim();
    console.log   ("inside", chatResponse)




//const chatResponse = await completion.choices[0].message;
console.log("outside", chatResponse)
//completion.then((result) => console.log(result.choices[0].message));

