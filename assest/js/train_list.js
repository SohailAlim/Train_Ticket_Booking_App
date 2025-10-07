import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  runTransaction
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
  getAuth,
  RecaptchaVerifier,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { firebaseConfig } from './config.js';
console.log("Firebase Config:", firebaseConfig);
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth(app);
const train_list_in_db = ref(database,"trainlist");
const param = new URLSearchParams(window.location.search);
const src_from_url = param.get("src");
console.log("src_from_url:", src_from_url);
const dst_from_url = param.get("dst");
console.log("dst_from_url:", dst_from_url);
const date_from_url = param.get("date");
const quota_from_url = param.get("quota");
function getstationcode(s){
  let x=0;
  let y = 0;
  for(let i=0;i<s.length;i++){
    if(s[i]=='[') x=i;
    if(s[i]==']') y =i;
  }
  return s.slice(x+1,y);
}
const src_stn_code = getstationcode(src_from_url);
const dst_stn_code = getstationcode(dst_from_url);
console.log(src_stn_code);
console.log(quota_from_url);
const date_from_urll = date_from_url;
console.log(typeof(date_from_url));
console.log(date_from_urll);
onValue(train_list_in_db,function(snapshot){
  document.getElementById("trains").innerHTML = "";
  const trains = snapshot.val();
  for(let trainkey in trains){
    let train = trains[trainkey];
    if (!train.stations) {
      console.log("No stations data for train:", trainkey);
      continue;
    }
    let stations = Object.entries(train.stations)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([code, data]) => ({ code, ...data }));
    let src_from_db = null;
    let src_index = -1;
    let i = 0;
    for(let station of stations){
      if(station.code==src_stn_code) {
        src_from_db = station.code;
        src_index = i;
        break;
      }
    }
    let dst_from_db = null;
    if(src_from_db!=null ){
      let dst_index = -1;
      let i = 0;
    for(let station of stations){
      if( station.code == dst_stn_code) {
        dst_from_db = station.code;
        dst_index = i;
        break
      }
      i++;
    }
    console.log("Source index:",src_index,"Destination index:",dst_index);
    if(dst_from_db!=null ){
      console.log("Train:",trainkey);
      let train_template = document.getElementById("train_template");
      let train_clone = train_template.cloneNode(true);
      train_clone.removeAttribute("id");
      train_clone.style.display = "block";
      train_clone.id = trainkey;
      console.log("Train clone id:", train_clone.id);
      let train_name = train.trainName;
      train_clone.querySelector(".header_part1").textContent = `${trainkey} - ${train_name}`;
      let days = train.daysOfOperation;
      let set = new Set();
      if (Array.isArray(days)) {
      set = new Set(days);   
      } else {
    console.warn(`Train ${trainkey} has invalid daysOfOperation:`, days);
    }
      let daysContainer = train_clone.querySelector(".Days");
      daysContainer.querySelectorAll("span").forEach(span => {
      let fullDay = span.className;
      if (set.has(fullDay)) {
      span.classList.add("active_day");
      }
});

      let no_seats_of_seats_in_dbb = train.seats[src_stn_code].SL;
      console.log("SL seats in db:", no_seats_of_seats_in_dbb);
      const sl_class_seats = train_clone.querySelector(".sl_no_of_seats");
      sl_class_seats.textContent = no_seats_of_seats_in_dbb;


      let no_of_3A_seats_in_dbb = train.seats[src_stn_code]["3A"];
      const threeA_class_seats = train_clone.querySelector(".third_ac_no_of_seats");
      threeA_class_seats.textContent = no_of_3A_seats_in_dbb;


      let no_of_2A_seats_in_dbb = train.seats[src_stn_code]["2A"];
      const twoA_class_seats = train_clone.querySelector(".second_ac_no_of_seats");
      twoA_class_seats.textContent = no_of_2A_seats_in_dbb;


      let no_of_1A_seats_in_dbb = train.seats[src_stn_code]["1A"];
      const oneA_class_seats = train_clone.querySelector(".first_ac_no_of_seats");
      oneA_class_seats.textContent = no_of_1A_seats_in_dbb;


      train_clone.querySelector(".arv_stn").textContent = make_station_name_compatible_for_train_list(src_from_url);
      train_clone.querySelector(".dst_stn").textContent = make_station_name_compatible_for_train_list(dst_from_url);


      train_clone.querySelector(".arv_time").textContent = train.stations[src_stn_code].departure;
      train_clone.querySelector(".dst_time").textContent = train.stations[dst_stn_code].arrival;
      

      train_clone.querySelector(".arv_day").textContent = get_day_of_week(date_from_urll);
      train_clone.querySelector(".arv_date").textContent = (new Date(date_from_urll)).getDate();
      train_clone.querySelector(".arv_month").textContent = (new Date(date_from_urll)).toLocaleString('default', { month: 'short' });
      train_clone.querySelector(".dst_day").textContent = get_day_of_week(date_from_urll);
      train_clone.querySelector(".dst_date").textContent = (new Date(date_from_urll)).getDate();
      train_clone.querySelector(".dst_month").textContent = (new Date(date_from_urll)).toLocaleString('default', { month: 'short' });


      let departure_time_str = train.stations[src_stn_code].departure;
      let arrival_time_str = train.stations[dst_stn_code].arrival;
      let [dep_hours, dep_minutes] = departure_time_str.split(':').map(Number);
      let [arr_hours, arr_minutes] = arrival_time_str.split(':').map(Number);
      let dep_total_minutes = dep_hours * 60 + dep_minutes;
      let arr_total_minutes = arr_hours * 60 + arr_minutes;
      let duration_minutes = arr_total_minutes - dep_total_minutes;
      if (duration_minutes < 0) {       
        duration_minutes += 24 * 60;
      }


      let duration_hours = Math.floor(duration_minutes / 60);
      let duration_mins = duration_minutes % 60;
      let duration_str = `${duration_hours}h ${duration_mins}m`;
      train_clone.querySelector(".Duration").textContent = duration_str;


      if(train.stations[dst_stn_code].day==1){
        train_clone.querySelector(".dst_day").textContent = get_day_of_week(new Date(new Date(date_from_urll).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        let dst_date = new Date(date_from_urll);
        dst_date.setDate(dst_date.getDate()+1);
        train_clone.querySelector(".dst_date").textContent = dst_date.getDate();
        train_clone.querySelector(".dst_month").textContent = dst_date.toLocaleString('default', { month: 'short' });
      }
      

      if(train.stations[dst_stn_code].day==2){
        train_clone.querySelector(".dst_day").textContent = get_day_of_week(new Date(new Date(date_from_urll).getTime() + 2*24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        let dst_date = new Date(date_from_urll);        
        dst_date.setDate(dst_date.getDate()+2);
        train_clone.querySelector(".dst_date").textContent = dst_date.getDate();
        train_clone.querySelector(".dst_month").textContent = dst_date.toLocaleString('default', { month: 'short' });
      }
      if(dst_index - src_index - 1 <=0){
        return;
      }
      train_clone.querySelector(".int_stn_count").textContent = (dst_index - src_index - 1).toString();

      if(set.has(get_day_of_week(date_from_urll))){
        document.getElementById("trains").appendChild(train_clone);
      }

    }}
  }

});
function get_day_of_week(date_str){
  const date = new Date(date_str);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}
function make_station_name_compatible_for_train_list(s){
    let bs = -1;
    let be = -1;
    for(let i=0;i<s.length;i++){
        if(s[i]=='[') bs = i;
        if(s[i]==']') be = i;
    }
    let string_to_be_removed = "";
    if(bs!=-1 && be!=-1 && be>bs){
      string_to_be_removed = s.substring(bs,be+1);
    }
    return s.replace(string_to_be_removed,"").trim();
}
console.log(document.querySelector(".select_class"));
document.addEventListener("click", e => {
  console.log("Clicked element:", e.target);
  const Train_div = e.target.closest(".train");
  if (!Train_div) return;
  const train_id = Train_div.id;
  if (e.target.closest(".sleeper_class")) {
    const sl_seats = Train_div.querySelector(".sl_no_of_seats").textContent;
    console.log("SL seats text:", sl_seats);
    let no_seats_of_seats_in_db = ref(database, `trainlist/${train_id}/seats/${src_stn_code}/SL`);
    runTransaction(no_seats_of_seats_in_db, seats => {
      return (seats || 0) - 1;
    });
  }
});
Promise.all([
fetch('assest/html/navbar.html').then(response => response.text()),
fetch('assest/html/sidebar.html').then(response=>response.text()),
fetch('assest/html/form.html').then(response=>response.text())
]).then(([navbarHTML,sidebarHTML,formHTML])=>{
  const parser = new DOMParser();
    const doc = parser.parseFromString(navbarHTML , 'text/html');
    const navbar = doc.getElementById("navbar");
    const cont = document.getElementById("container");
    cont.appendChild(navbar);
    function update_clock() {
  const now = dayjs();
  const formatted = now.format("DD MMM YYYY, HH:mm:ss");
  document.getElementById("time_date").innerHTML = formatted;
}
const side_bar = parser.parseFromString(sidebarHTML,'text/html');
    const sidebar = side_bar.getElementById("menu_items");
    document.body.appendChild(sidebar);
  const menu_toggle = document.getElementById("toggle_btn");
  const menu_items = document.getElementById("menu_items");
  const overlay = document.getElementById("overlay");
  function open_Menu() {
    menu_items.classList.add("opensb");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function close_Menu() {
    menu_items.classList.remove("opensb");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  menu_toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (menu_items.classList.contains("opensb")) {
      close_Menu();
    } else {
      open_Menu();
    }
  });
  overlay.addEventListener("click", close_Menu);
  document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") {
      close_Menu();
    }
  });
var dropdown = document.getElementsByClassName("dropdown_btn");
var i;
for (var i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var dropdowncontent = this.nextElementSibling;
    if (dropdowncontent.style.display === "block") {
      dropdowncontent.style.display = "none";
    } else {
      dropdowncontent.style.display = "block";
    }
  });
}
update_clock();
setInterval(update_clock, 1000);
const form = parser.parseFromString(formHTML,'text/html');
const form_container = form.getElementById('form_container');
document.getElementById("searchbox").appendChild(form_container);
let src = document.getElementById("Source");

let dst = document.getElementById("Destination");

let exchange = document.getElementById("exchange");
let exchange_icon = exchange.getElementsByTagName("i")[0];
exchange.addEventListener("keydown", function (f) {
  if (f.key === "Enter") {
    f.preventDefault();
  }
});
exchange.addEventListener("click", (e) => {
  e.preventDefault();

  let source = src.value.trim();
  let destination = dst.value.trim();
  if (source === "" || !src_stn.includes(source)) {
    alert("Please enter a valid source");
    return;
  }
  if ((source !== "" && destination === "") || !dst_stn.includes(destination)) {
    alert("Please enter a valid destination");
    return;
  }
  if (source === destination) {
    alert("Source and destination cannot be the same.");
    return;
  }
  
  exchange_icon.classList.toggle("rotate");
  let temp = src.value;
  src.value = dst.value;
  dst.value = temp;

});
const src_stn = [
  "Patna Junction [PNBE]",
  "New Delhi [NDLS]",
  "Howrah Junction [HWH]",
  "Mumbai CST [CSTM]",
  "Chennai Central [MAS]",
  "Secunderabad Junction [SC]",
  "Kanpur Central [CNB]",
  "Ahmedabad Junction [ADI]",
  "KSR BENGALURU [SBC]",
  "Lucknow NR [LKO]",
  ];
const dst_stn = [
  "Patna Junction [PNBE]",
  "New Delhi [NDLS]",
  "Howrah Junction [HWH]",
  "Mumbai CST [CSTM]",
  "Chennai Central [MAS]",
  "Secunderabad Junction [SC]",
  "Kanpur Central [CNB]",
  "Ahmedabad Junction [ADI]",
  "Bangalore City Junction [SBC]",
  "Lucknow NR [LKO]",
];
// suggestion box for source station
const suggestion_box_for_src = document.getElementById("suggestions_for_src");
let active_index = -1;
src.addEventListener("input", () => {
  active_index = -1;
  suggestion_box_for_src.innerHTML = "";
  let source_input = src.value.trim();
  source_input = source_input.toLowerCase();
  // if source input if empty string then return;
  if (source_input === "") {
    suggestion_box_for_src.style.display = "none";
    return;
  }
  const matched_source_stn = src_stn.filter((curr) =>
    curr.toLowerCase().includes(source_input)
  );
  if (matched_source_stn.length === 0) {
    suggestion_box_for_src.style.display = "none";
    return;
  }
  matched_source_stn.forEach((curr) => {
    // itrate through each matched source station name
    const newdiv = document.createElement("div"); //  create a new div
    newdiv.textContent = curr; // add text to the new div that is the matched source station name
    newdiv.className = "source_suggestion"; // add class to the div
    newdiv.addEventListener("click", () => {
      // tell what happens when the suggestion is clicked
      src.value = curr; // change the input value to the clicked station name
      suggestion_box_for_src.style.display = "none"; // after the input value is clicked then there is no need of the suggestion box so we remove it
    });
    suggestion_box_for_src.appendChild(newdiv); // we add the new div to the suggestion box in original html
  });
  suggestion_box_for_src.style.display = "block"; // now we show up the suggestion box
});
// add fxn to respond with the keyboard arrow up/down, esc
src.addEventListener("keydown", (e) => {
  const suggestions =
    suggestion_box_for_src.querySelectorAll(".source_suggestion");
  if (suggestions.length === 0) return;
  if (e.key === "ArrowDown") {
    //move selection down
    active_index = (active_index + 1) % suggestions.length;
    e.preventDefault();
    update_style_of_suggestion_box(suggestions);
  } else if (e.key === "ArrowUp") {
    if (active_index === -1) return;
    // move selection up
    active_index = (active_index - 1) % suggestions.length;
    e.preventDefault();
    update_style_of_suggestion_box(suggestions);
  } else if (e.key === "Enter") {
    e.preventDefault();
    src.value = suggestions[active_index].textContent;
    suggestion_box_for_src.style.display = "none";
  } else if (e.key === "Escape") {
    suggestion_box_for_src.style.display = "none";
    active_index = -1;
  }
});
function update_style_of_suggestion_box(suggestions) {
  suggestions.forEach((item, i) => {
    item.classList.toggle("active3", i === active_index);
    if (i === active_index && item.scrollIntoView) {
      item.scrollIntoView({ block: "nearest" });
    }
  });
}
// suggestion box for destination
let suggestion_box_for_dst = document.getElementById("suggestions_for_dst");
let activeindex = -1;
dst.addEventListener("input",()=>{
    
    suggestion_box_for_dst.innerHTML = "";
    let des = dst.value.trim();
    des = des.toLowerCase();
    if(des==="") return;
    activeindex=-1;
    const matched_dest_stn = dst_stn.filter(filterfxn);
    if(matched_dest_stn.length ===0) return;
    function filterfxn(stn){
        if(stn===src.value){
            return 0;
        }
        stn=stn.toLowerCase();
        if(stn.includes(des)){
            return 1;
        }
    }
    matched_dest_stn.forEach(stn=>{
        const new_div = document.createElement("Div");
        new_div.textContent = stn;
        new_div.className = "dst_sugg";
        new_div.addEventListener("click",()=>{
            dst.value = stn;
            suggestion_box_for_dst.style.display = "none";
        });
        suggestion_box_for_dst.appendChild(new_div);
    });
    suggestion_box_for_dst.style.display = "block";
});
document.addEventListener("click",e=>{
        if(!e.target.closest("dst_box")){
            suggestion_box_for_dst.style.display="none";
        }
    });
document.addEventListener("click",e=>{
        if(!e.target.closest("Source_box")){
            suggestion_box_for_src.style.display="none";
        }
    });
dst.addEventListener("keydown",e=>{
    const dst_suggestions = document.querySelectorAll(".dst_sugg");
    if(dst_suggestions.length===0) return ;
    if(e.key==="ArrowDown"){
        activeindex=(activeindex+1)%dst_suggestions.length;
        e.preventDefault();
        update_style_of_dst_box(dst_suggestions);
    }
    else if(e.key==="ArrowUp"){
        if(activeindex===-1) return;
        activeindex=(activeindex-1)%dst_suggestions.length;
        e.preventDefault();
        update_style_of_dst_box(dst_suggestions);
    }
    else if(e.key==="Enter"){
        dst.value = dst_suggestions[activeindex].textContent;
        activeindex = -1;
        e.preventDefault();
        suggestion_box_for_dst.style.display = "none";
    }
    else if(e.key==="Escape"){
        activeindex = -1;
        suggestion_box_for_dst.style.display = "none";
    }
    function update_style_of_dst_box(suggestions){
        suggestions.forEach((curr,i)=>{
            curr.classList.toggle("active4",i===activeindex);
            if(i===activeindex && curr.scrollIntoView){
                curr.scrollIntoView({block: "nearest"});
            };
        });
    };
    document.addEventListener("click",e=>{
        if(!e.target.closest("dst_box")){
            suggestion_box_for_dst.style.display="none";
        }
    });
});
document.getElementById("station_form").addEventListener("submit",e=>{
  e.preventDefault();
  const source = document.getElementById("Source").value;
  const destination = document.getElementById("Destination").value;
  const quota = document.getElementById("Quota").value;
  if(source=="" || destination==""){
    window.alert("Enter Valid Station");
    return;
  }
  const date = document.getElementById("date").value;
  const src_enc = encodeURIComponent(source);
  const dst_enc = encodeURIComponent(destination);
  const date_enc = encodeURIComponent(date);
  const quota_enc = encodeURIComponent(quota);
  const url = `train_list.html?src=${src_enc}&dst=${dst_enc}&date=${date_enc}&quota=${quota_enc}`;
  console.log(url);
  window.location.href = url;
});
console.log("Source:", src_from_url);
  console.log("Destination:", dst_from_url);
  src.value = src_from_url;
  dst.value = dst_from_url;
  document.getElementById("date").value = date_from_urll;
  document.getElementById("Quota").value = quota_from_url;
});
flatpickr("#dst_time_filter_input", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",   // 24-hour format HH:MM
    defaultDate: "13:30" // optional: set a default time
});
flatpickr("#source_time", {               
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",   // 24-hour format HH:MM
    defaultDate: "12:30" // optional: set a default time
}); 


// LOG IN SIGN UP LOGIC

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const googleBtn = document.getElementById('google-btn');
const errorDiv = document.getElementById('error-msg');

signupBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    errorDiv.style.color = 'green';
        errorDiv.textContent = "Sign-up successful! Check your email for verification link.";
        emailInput.value = '';
        passwordInput.value = '';
  } catch (error) {
    errorDiv.style.color = 'red';
    errorDiv.textContent = error.message;
  }
});

loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            alert("Please verify your email before logging in!");
            return;
        }
        errorDiv.style.color = 'green';
        errorDiv.textContent = "Login successful! Welcome " + userCredential.user.email;
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        errorDiv.style.color = 'red';
        errorDiv.textContent = error.message;
    }
});

///////////////////////////////////////////////////////////////////////////////////

googleBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        errorDiv.style.color = 'green';
        errorDiv.textContent = "Google login successful! Welcome " + user.email;
    } catch (error) {
        errorDiv.style.color = 'red';
        errorDiv.textContent = error.message;
    }
});
