# hifi_wechat
project that users logged in with wechat authentication and show live subtitles during activities presentations

### Idea and Design
***
Since the development of the smart devices and moblie web technology, the penetration rate of smart phone is getting higher and higher, which symbolizes the more convenient and itelligent life, people go everywhere taking his phone.

Wether enterprise or college, there are many assembles or activities.How about putting the smart devices and activities together?That's must be more fun!

There only one internet company provides this kind of service called HI Activity in present.However it seems that HI Activity is specially designed for enterprises, and if you want to use more useful and enjoyable functions you should pay more for it.Not only the organizer but also the audiences who want to participate in the activing carnival have to pay for their subscribed special functions.For our students, it is too expensive to use it.So, HIFI born.

### Tech Stacks
***
* nodejs v8.9.0
* express v4.16.2
* mongodb v3.4.0
* mongoose v4.13.2
* vue.js v2.4.4
* socket.io 2.0
* bootstrap v3
* ...

### Project Structure
***
|-config
|---|-wechat.js
|-node_modules
|-server
|---|-common
|---|-controller
|---|-model
|---|-router
|---|-socket
|---|-views
|---|-access_token.txt
|---|-jsapu_token.txt
|---|-index.js
|-static
|---|-css
|---|-js
|---|-fonts
|---|-image
|---|-plus
|---|-emoji
|-bin
|---|-dev-server.js
|-package.json

[view in Github](https://github.com/PorYoung/hifi_wechat)
> directory **server**
* directory **commom** includes files that connect to  mongodb database and some config files.
* directory **controller** includes files which handle the main logic of the program on the server end.
* directory **medel** includes files that deal with the interaction with Wechat.
* **router** design the server router and export APIs.
* **views** includes the front end pages.
* **socket** handle the socket correspondence.
* **access_token.txt** and **jsapi.token** saved the tickes that needed to correspond to Wechat server.

> directory **static**
A static server includes static files.

### Docs and Description
***

### Quotes and Dependences
***
