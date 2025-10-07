function update_clock() {
  const now = dayjs();
  const formatted = now.format("DD MMM YYYY, HH:mm:ss");
  document.getElementById("time_date").innerHTML = formatted;
}
update_clock();
setInterval(update_clock, 1000);
document.addEventListener("DOMContentLoaded", () => {
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
  // filter src_stn array on the basis of if curr(converted to lower case) has any char that matches the chars in source input
  const matched_source_stn = src_stn.filter((curr) =>
    curr.toLowerCase().includes(source_input)
  );
  // if no matches found then do not display suggestion box
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
flatpickr("#date", {
  dateFormat: "d/m/Y",
  defaultDate: "today"
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
  let date = document.getElementById("date").value;
    console.log(date);
  function formatDate(dateStr) {
let [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}
  date = formatDate(date);
  const src_enc = encodeURIComponent(source);
  const dst_enc = encodeURIComponent(destination);
  const date_enc = encodeURIComponent(date);
  const quota_enc = encodeURIComponent(quota);
  const url = `train_list.html?src=${src_enc}&dst=${dst_enc}&date=${date_enc}&quota=${quota_enc}`;
  console.log(url);
  window.location.href = url;
});
