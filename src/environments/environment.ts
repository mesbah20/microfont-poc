// puku-cli --resume c91047eb-7405-454e-8691-139113537283
export const environment = {
  production: false,
  appName: 'Microfont POC',
  appId: '1',
  appConfigUrl: '/asset/config/app-config.json',

  apiBaseUrl: 'http://192.168.20.218/CloudNetAPI',
  centrinoUrl: 'http://192.168.20.218/CentrinoAPI',
  sentinelUrl: 'http://192.168.20.218/SentinelAPI',
  bffUrl: 'http://192.168.20.218/BffAPI',
  reportManagementApiUrl: 'http://192.168.20.218/ReportManagementAPI',
  novu_api: 'https://api.novu.co',
  novu_socket: 'wss://ws.novu.co',
};
/**
later must execute this for popup design issue:
===============================================
1. follow the error popup response, which is showing in popup as massgee body, header from demo 
project: (E:\CloudNetWeb\src\CloudNetWebCBPLC_Dynamic). Fix error/success popup card size like demo porject.
You just need to folow the popup header, massege body response from demo project
then update the popup design, colour, buttons etc like modern UI. Analysis the design by yourself 
and update the current application popup design like modern UI.  
==============


now:
2.
Analysis the dashboard design, API call list for dashboard form this demo project:
(E:\CloudNetWeb\src\CloudNetWebUBL_Dynamic)! do not copy design consept form this demo project 
just analysis! Then with those dashboard API from demo project, re-design a modern UI dashboard
for this current application ! after login for dashboard data which API call be called i will 
provide you some idea :
1. CloudNetAPI/api/BankAccount/getAccountListWithBalance?accountType=0
2. CloudNetAPI/api/Notification/GetAllNotifications
3. CloudNetAPI/api/ActivityLog/GetTopActivityLog?count=5

there can be more, you will analysis this above demo project what i path i provide you!
And from dashboard replace this time clock to top navbar besides option icon. place it in right 
position as you prefer the best ! 

====================
when i view this application in responsive mode, in top left corner a menu icon showing ! I also need this 
for desktop version, so that when i click on this menu icon, the sidebar menu panel should be hide and show.
remove (Account Balance) part from sidebar panel. only keep this light dark background colour for menu submenu 
part, For other part change the background colour! change sign out button design, remove porfile 
redirect click event from sign out button portion! only keep slightly large signout button. 
make this button colour red like demo project background colour! Analysis this colour combination
what will be more effective and update like that!  Change the side bar panel bank logo same as demo
project! same size! 

for top navbar:
==================
follow the demo project navbar features, menu, bank logo, logo icon then update current application 
navbar design like modern UI and keep all those features, option.  

update sidebar menu panel like this angular free resouce project: (https://adminlte.io/themes/v4/widgets/small-box.html)
Analysis this provide project siebar design and update this current application sidebar. 

At the bottom of this sidebar, make a sign out button ! Analysis the navbar design and 
sidebar design, review like a client then update like modern UI!  

============
done
in login card, update sign in tab name to login, keep two button refresh and login like demo project. 
in self registration tab do not keep scrollable portion. update button like demo project button name 
and keep 2 buttons like demo project! Analysis the login card design and review like a client then 
update like modern UI!  




=====================
login page API: done
in demo project login page this API call happens: (CloudNetAPI/api/BankAccount/GetAdvertisementList?channelName=IBU)
follow this from demo porject how response showing and make this similar for 
this current application. when you creat component, follow demo project file structure, make html, ts and CSS(if needed custom design)
) in this current applicaiton !


 
*/