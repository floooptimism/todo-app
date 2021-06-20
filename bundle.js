/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./client/static/js/database/indexedDB.js
/* harmony default export */ const indexedDB = ((function(){
    let db_name = "todolist";
    let db_version = 2;

    function start(cb, error){
        let db;

        function write(objectstore, data, cb_success, cb_error){
    
            let request = objectstore.add(data);

            request.onsuccess = function(){
                if(cb_success) cb_success(objectstore);
            }

            request.onerror = function(event){
                if(cb_error) cb_error();
            
            }
        }

        function update(objectstore, data, cb_success, cb_error){
            let request = objectstore.put(data);

            request.onsuccess = function(){
                if(cb_success) cb_success(objectstore);
            }

            request.onerror = function(event){
                if(cb_error) cb_error();
            }
        }
    
        function readAll(objectstore, cb){
            let request = objectstore.getAll();
    
            request.onerror = function(event){
                alert("Error on readAll()");
            }
    
            request.onsuccess = function(event){
                cb(event.target.result, objectstore);
            }
        }

        function get(objectstore, key, cb){
            let request = objectstore.get(key);

            request.onerror = function(){
                alert("Error on get()");
            }

            request.onsuccess = function(event){
                cb(event.target.result, objectstore);
            }
        }

        function getObjectStore(store,mode){
            let transaction = db.transaction(store , mode);
            let objectstore = transaction.objectStore(store);

            return objectstore;
        }

        // request DB
        let  request = window.indexedDB.open(db_name, db_version);

        request.onerror = function(){
            alert("Error loading the database.");
            alert("Retrying");
            setTimeout(init, 2000);
        }

        request.onsuccess = function(event){
            db = event.target.result;


            db.onerror = function(event) {
                console.log("Db error");
                if(error) error();
              };
            
            cb({readAll, write, get, update, getObjectStore});
            db.close();
        }

        request.onupgradeneeded = function(event){
            var db = event.target.result;

        // Create an objectStore for this database
            var project_objectstore = db.createObjectStore("projects", {keyPath : "name",autoIncrement: true});
            var todo_objectstore = db.createObjectStore("tasks", { keyPath:"project" });
            
        }
    }



    return {
        start
    }
})());
;// CONCATENATED MODULE: ./client/static/js/views/main.js

/* harmony default export */ const main = ((function () {

    function enter(query) {
        console.log(query);
        let project_list = document.getElementById("project-list");
        let add_new = document.getElementById('add-new');
        let project_length = document.getElementById('project-length');

        //create template for card
        let card_link = document.createElement('a');
            card_link.classList.add('project-link');
            card_link.setAttribute('data-link','');

        let card = document.createElement("div");
            card.classList.add('card','justify-content-center','flex-column');
            card.innerHTML = document.getElementById('template-project-card').innerHTML;
        
        card_link.appendChild(card);

        function modify_number_of_projects(number){
            project_length.innerText = "Projects - " + number;
        }


        //populate project-list
        function update(){
            indexedDB.start(function(db){
                let objectstore = db.getObjectStore("projects", "readwrite")
                db.readAll(objectstore, function(data){
                    project_list.innerHTML = '';
                    modify_number_of_projects(data.length);
                    data = data.sort((a,b)=>{
                        return b.timestamp - a.timestamp
                    })
                    data.forEach(element => {
                        const pcard = card_link.cloneNode(true);
                        pcard.setAttribute('href','/project/'+encodeURIComponent(element.name))
                        pcard.querySelector('span').appendChild(document.createTextNode(element.name));
                        project_list.appendChild(pcard);
                    });
                })
    
            });
        }
        
        // add project
        function handleButton(){
            let input = add_new.querySelector('input');
            let value = input.value.trim();
            if(value == "") return;
            
            function error(){
                snackbar_add_error("Project '"+value+"' already exist.");
            }

            function write_success(){
                snackbar_add_success("Project '"+value+"' added.");
                update();
                input.value = '';
            }

            indexedDB.start(function(db){
                let objectstore = db.getObjectStore("projects","readwrite");
                db.write(objectstore,{name:value,timestamp:Date.now()},write_success);
            }, error)
        }

        function form(event){
            event.preventDefault();
        }
        //attach eventlistener for button
        add_new.querySelector('button').addEventListener('click', handleButton)
        add_new.querySelector('form').addEventListener('submit',form)

        update();


        return function(){
            //remove eventlisteners
            add_new.querySelector('form').removeEventListener('submit', form)
            add_new.querySelector('button').removeEventListener('click', handleButton);
        }

    }


    function render() {
        return `<div id="header">
        <h3 class='title'>To-do List</h3>
    </div>

    <div id='add-new' style="margin-bottom: 3rem;">
        <form>
            <input type='text' placeholder="Add new project"/>
            <button><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-a</title><line x1="256" y1="112" x2="256" y2="400" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="400" y1="256" x2="112" y2="256" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg></button>
        </form>
    </div>

    <h4 id='project-length' style="border-bottom: 1px solid rgb(153, 151, 151);font-weight: 400;padding-bottom: 7px;">Projects - 3</h4>
    
    <div id="project-list" class='project-list'>
       

    </div>
    
    <script id="template-project-card" class="text/template">
        <div class="card justify-content-center flex-column">
            <div class='card-title'>
            <svg class='project-logo' xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-o</title><line x1="224" y1="184" x2="352" y2="184" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="224" y1="256" x2="352" y2="256" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="224" y1="327" x2="352" y2="327" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><path d="M448,258c0-106-86-192-192-192S64,152,64,258s86,192,192,192S448,364,448,258Z" style="fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:32px"/><circle cx="168" cy="184" r="8" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><circle cx="168" cy="257" r="8" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><circle cx="168" cy="328" r="8" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg>
                <span></span>
            </div>

            <div class='card-due-date'>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.9375 1.375H8.59375V1.04092C8.59375 0.855937 8.45152 0.697167 8.26654 0.687929C8.22006 0.685689 8.17362 0.69291 8.13001 0.709152C8.08641 0.725395 8.04655 0.750322 8.01286 0.782422C7.97918 0.814522 7.95236 0.853127 7.93403 0.895899C7.91571 0.93867 7.90625 0.984717 7.90625 1.03125V1.375H3.09375V1.04092C3.09375 0.855937 2.95152 0.697167 2.76654 0.687929C2.72006 0.685689 2.67362 0.69291 2.63001 0.709152C2.58641 0.725395 2.54655 0.750322 2.51286 0.782422C2.47918 0.814522 2.45236 0.853127 2.43403 0.895899C2.41571 0.93867 2.40625 0.984717 2.40625 1.03125V1.375H2.0625C1.69783 1.375 1.34809 1.51986 1.09023 1.77773C0.832366 2.03559 0.6875 2.38533 0.6875 2.75V8.9375C0.6875 9.30217 0.832366 9.65191 1.09023 9.90977C1.34809 10.1676 1.69783 10.3125 2.0625 10.3125H8.9375C9.30217 10.3125 9.65191 10.1676 9.90977 9.90977C10.1676 9.65191 10.3125 9.30217 10.3125 8.9375V2.75C10.3125 2.38533 10.1676 2.03559 9.90977 1.77773C9.65191 1.51986 9.30217 1.375 8.9375 1.375ZM2.92188 8.9375C2.81989 8.9375 2.7202 8.90726 2.63541 8.8506C2.55061 8.79394 2.48453 8.71341 2.4455 8.61919C2.40647 8.52498 2.39626 8.4213 2.41616 8.32128C2.43605 8.22126 2.48516 8.12938 2.55727 8.05727C2.62938 7.98516 2.72126 7.93605 2.82128 7.91616C2.9213 7.89626 3.02498 7.90647 3.1192 7.9455C3.21341 7.98453 3.29394 8.05061 3.3506 8.13541C3.40726 8.2202 3.4375 8.31989 3.4375 8.42187C3.4375 8.55863 3.38318 8.68978 3.28648 8.78648C3.18978 8.88317 3.05863 8.9375 2.92188 8.9375ZM2.92188 7.21875C2.81989 7.21875 2.7202 7.18851 2.63541 7.13185C2.55061 7.07519 2.48453 6.99466 2.4455 6.90044C2.40647 6.80623 2.39626 6.70255 2.41616 6.60253C2.43605 6.50251 2.48516 6.41063 2.55727 6.33852C2.62938 6.26641 2.72126 6.2173 2.82128 6.19741C2.9213 6.17751 3.02498 6.18772 3.1192 6.22675C3.21341 6.26578 3.29394 6.33186 3.3506 6.41666C3.40726 6.50145 3.4375 6.60114 3.4375 6.70312C3.4375 6.83988 3.38318 6.97103 3.28648 7.06773C3.18978 7.16442 3.05863 7.21875 2.92188 7.21875ZM4.64062 8.9375C4.53864 8.9375 4.43895 8.90726 4.35416 8.8506C4.26937 8.79394 4.20328 8.71341 4.16425 8.61919C4.12522 8.52498 4.11501 8.4213 4.13491 8.32128C4.1548 8.22126 4.20391 8.12938 4.27602 8.05727C4.34813 7.98516 4.44001 7.93605 4.54003 7.91616C4.64005 7.89626 4.74373 7.90647 4.83795 7.9455C4.93216 7.98453 5.01269 8.05061 5.06935 8.13541C5.12601 8.2202 5.15625 8.31989 5.15625 8.42187C5.15625 8.55863 5.10193 8.68978 5.00523 8.78648C4.90853 8.88317 4.77738 8.9375 4.64062 8.9375ZM4.64062 7.21875C4.53864 7.21875 4.43895 7.18851 4.35416 7.13185C4.26937 7.07519 4.20328 6.99466 4.16425 6.90044C4.12522 6.80623 4.11501 6.70255 4.13491 6.60253C4.1548 6.50251 4.20391 6.41063 4.27602 6.33852C4.34813 6.26641 4.44001 6.2173 4.54003 6.19741C4.64005 6.17751 4.74373 6.18772 4.83795 6.22675C4.93216 6.26578 5.01269 6.33186 5.06935 6.41666C5.12601 6.50145 5.15625 6.60114 5.15625 6.70312C5.15625 6.83988 5.10193 6.97103 5.00523 7.06773C4.90853 7.16442 4.77738 7.21875 4.64062 7.21875ZM6.35938 8.9375C6.25739 8.9375 6.1577 8.90726 6.07291 8.8506C5.98812 8.79394 5.92203 8.71341 5.883 8.61919C5.84397 8.52498 5.83376 8.4213 5.85366 8.32128C5.87355 8.22126 5.92266 8.12938 5.99477 8.05727C6.06688 7.98516 6.15876 7.93605 6.25878 7.91616C6.3588 7.89626 6.46248 7.90647 6.5567 7.9455C6.65091 7.98453 6.73144 8.05061 6.7881 8.13541C6.84476 8.2202 6.875 8.31989 6.875 8.42187C6.875 8.55863 6.82067 8.68978 6.72398 8.78648C6.62728 8.88317 6.49613 8.9375 6.35938 8.9375ZM6.35938 7.21875C6.25739 7.21875 6.1577 7.18851 6.07291 7.13185C5.98812 7.07519 5.92203 6.99466 5.883 6.90044C5.84397 6.80623 5.83376 6.70255 5.85366 6.60253C5.87355 6.50251 5.92266 6.41063 5.99477 6.33852C6.06688 6.26641 6.15876 6.2173 6.25878 6.19741C6.3588 6.17751 6.46248 6.18772 6.5567 6.22675C6.65091 6.26578 6.73144 6.33186 6.7881 6.41666C6.84476 6.50145 6.875 6.60114 6.875 6.70312C6.875 6.83988 6.82067 6.97103 6.72398 7.06773C6.62728 7.16442 6.49613 7.21875 6.35938 7.21875ZM6.35938 5.5C6.25739 5.5 6.1577 5.46976 6.07291 5.4131C5.98812 5.35644 5.92203 5.27591 5.883 5.18169C5.84397 5.08748 5.83376 4.9838 5.85366 4.88378C5.87355 4.78376 5.92266 4.69188 5.99477 4.61977C6.06688 4.54766 6.15876 4.49855 6.25878 4.47866C6.3588 4.45876 6.46248 4.46897 6.5567 4.508C6.65091 4.54702 6.73144 4.61311 6.7881 4.69791C6.84476 4.7827 6.875 4.88239 6.875 4.98437C6.875 5.12113 6.82067 5.25228 6.72398 5.34898C6.62728 5.44567 6.49613 5.5 6.35938 5.5ZM8.07812 7.21875C7.97614 7.21875 7.87645 7.18851 7.79166 7.13185C7.70687 7.07519 7.64078 6.99466 7.60175 6.90044C7.56272 6.80623 7.55251 6.70255 7.57241 6.60253C7.5923 6.50251 7.64141 6.41063 7.71352 6.33852C7.78563 6.26641 7.87751 6.2173 7.97753 6.19741C8.07755 6.17751 8.18123 6.18772 8.27545 6.22675C8.36966 6.26578 8.45019 6.33186 8.50685 6.41666C8.56351 6.50145 8.59375 6.60114 8.59375 6.70312C8.59375 6.83988 8.53942 6.97103 8.44273 7.06773C8.34603 7.16442 8.21488 7.21875 8.07812 7.21875ZM8.07812 5.5C7.97614 5.5 7.87645 5.46976 7.79166 5.4131C7.70687 5.35644 7.64078 5.27591 7.60175 5.18169C7.56272 5.08748 7.55251 4.9838 7.57241 4.88378C7.5923 4.78376 7.64141 4.69188 7.71352 4.61977C7.78563 4.54766 7.87751 4.49855 7.97753 4.47866C8.07755 4.45876 8.18123 4.46897 8.27545 4.508C8.36966 4.54702 8.45019 4.61311 8.50685 4.69791C8.56351 4.7827 8.59375 4.88239 8.59375 4.98437C8.59375 5.12113 8.53942 5.25228 8.44273 5.34898C8.34603 5.44567 8.21488 5.5 8.07812 5.5ZM9.625 2.92187V3.26562C9.625 3.31121 9.60689 3.35493 9.57466 3.38716C9.54243 3.41939 9.49871 3.4375 9.45312 3.4375H1.54688C1.50129 3.4375 1.45757 3.41939 1.42534 3.38716C1.39311 3.35493 1.375 3.31121 1.375 3.26562V2.75C1.37551 2.56782 1.44811 2.39325 1.57693 2.26443C1.70575 2.13561 1.88032 2.06301 2.0625 2.0625H8.9375C9.11968 2.06301 9.29425 2.13561 9.42307 2.26443C9.55189 2.39325 9.62449 2.56782 9.625 2.75V2.92187Z" fill="#AE7F64"/>
                </svg>
                <span>06/05/21</span>
            </div>

            <div class='card-tasks'>
                <span>0 out of 0 tasks completed</span>
            </div>
        </div>
    </script>
    
    `
    }


    return {
        enter,
        render
    }
})());
;// CONCATENATED MODULE: ./client/static/js/views/project.js


/* harmony default export */ const project = ((function(){
    function enter(query){
        const project_name = decodeURIComponent(query.name);
        document.querySelector('.project-name').querySelector('#title').innerText = '👽 - ' + project_name;
        
        // initialize project if it isn't yet
        indexedDB.start(function(db){
            let objectstore = db.getObjectStore("tasks", "readwrite");
                
            db.get(objectstore, project_name , function(result, objectstore){
                if(!result){
                    let init = {
                        project: project_name,
                        progress: [],
                        completed: [],
                        meta: {
                            timestamp: Date.now(),
                            due: null,
                            total_length: 0
                        },
                        key: 0
                    }
                    db.write(objectstore, init, function(){
                        console.log("projct iinit");
                    })
                }
            })
        })        

        const dropdown = document.getElementById('settings-dropdown');
        const settings = document.getElementById('settings-logo');

        const add_new = document.getElementById('add-new');
        const input = add_new.querySelector('input');

        function hideDropdown(e){
            if(e.target.closest("#settings-logo")){
                dropdown.classList.toggle("state-shown");
                settings.classList.toggle("rotate");
                return;
            }
            if(!e.target.closest("#settings-dropdown") && dropdown.classList.contains("state-shown")){
                dropdown.classList.toggle("state-shown");
                settings.classList.toggle("rotate");
            }
            
        }

        const modify_number_of_tasks = (function(){
            const task_list = document.getElementById("task-indicator");

            return function(length){
                task_list.innerText = "Tasks - "+ length;
            }
        })()

        const modify_number_of_completed = (function(){
            const completed_list = document.getElementById("completed-indicator");

            return function(length){
                completed_list.innerText = "Completed - "+ length;
            }
        })()

        const updateList = (function(){
            const task_progress = document.querySelector("[data-status='progress'].task-list");
            const task_completed = document.querySelector("[data-status='completed'].task-list");

             // create element for template, card-progress
            const task_template = document.createElement("div");
                task_template.classList.add("card","items-center");
            const completed_template = task_template.cloneNode();

            //populate template
            task_template.innerHTML = document.getElementById("template-progress-card").innerHTML;
            task_template.dataset['status'] = 0;
            completed_template.innerHTML = document.getElementById("template-completed-card").innerHTML;
            completed_template.dataset['status'] = 1;
            
 
            return function(type, indicator = function(){}){
                let local_container;
                let template;
                if(type == "progress"){
                    local_container = task_progress;
                    template = task_template;
                }else if(type == "completed"){
                    local_container = task_completed;
                    template = completed_template;
                }

                indexedDB.start(function(db){
                    let local_objectstore = db.getObjectStore("tasks", "readwrite")
                    db.get(local_objectstore, project_name, function(data, local_objectstore){
                        local_container.innerHTML = '';
                        indicator(data[type].length);
                        if(type == "progress"){
                            data[type] = data[type].sort((a,b)=>{
                                return a.key - b.key
                            })
                        }
                        data[type].forEach(element => {
                            const tasklist = template.cloneNode(true);
                            tasklist.dataset['key'] = element.key;
                            tasklist.querySelector('.task-description').appendChild(document.createTextNode(element.description));
                            local_container.appendChild(tasklist);
                            setTimeout(function(){
                                tasklist.style.height = tasklist.clientHeight + 'px';
                            }, 0);
                        });
                    })
        
                });
                

            }

        })()

        function addTask(e){
            let value = input.value.trim();
            if(value == "") return;

            indexedDB.start(function(db){
                let taskstore = db.getObjectStore("tasks", "readwrite");
                db.get(taskstore, project_name, function(result, objectstore){
                    result.progress = [...result.progress, {key: result.key, description: value, timestamp: Date.now()}];
                    result.key += 1;
                    result.meta.total_length += 1;

                    db.update(objectstore, result, function(){
                        input.value = "";
                        updateList("progress", modify_number_of_tasks);
                    }); 
                });
            })
        }

        function form(e){
            e.preventDefault()
        }

        const toggle_task = (function(){
            const task_progress = document.querySelector("[data-status='progress'].task-list");
            const task_completed = document.querySelector("[data-status='completed'].task-list");

            function switch_parent(el,parent){
                el.remove();
                if(parent){
                    task_completed.insertBefore(el, task_completed.firstChild);
                }else{
                    task_progress.appendChild(el);
                }
            }

            function db_toggle_task(key, status){
                const status_identifier = status ? "completed":"progress";
                const status_identifier_opposite = !status ? "completed":"progress";

                indexedDB.start(function(db){
                    let objectstore = db.getObjectStore("tasks","readwrite");

                    db.get(objectstore, project_name, function(result, objectstore){
                        const index = result[status_identifier_opposite].findIndex(function(element){
                            return element.key == key;
                        })

                        const data = result[status_identifier_opposite].splice(index,1)[0];

                        result[status_identifier] = [data, ...result[status_identifier]];

                        db.update(objectstore, result, function(){
                            modify_number_of_completed(result.completed.length);
                            modify_number_of_tasks(result.progress.length);
                        })
                    })
                })
            }


            // responsible for removing transition listener, called inside the listener itself
            let removeListener = function(el, x){
                el.removeEventListener('transitionend',x);
            }

            let rl = removeListener;

            function handleTransition(el,cb,controller,event){
                let style = window.getComputedStyle(el);
                const status = parseInt(el.dataset['status'])
                if(style.height == "0px" && style.marginBottom == "0px" && style.marginTop == "0px" &&
                  style.marginLeft == "0px" && style.marginRight == "0px"   && style.paddingBottom == "0px"
                  && style.paddingTop == "0px" && style.paddingLeft == "0px" && style.paddingRight == "0px" ){
                    rl();
                    if(status){
                        switch_parent(el, 1);
                    }else{
                        switch_parent(el, 0);
                    }
                    setTimeout(function(){
                        el.classList.add('task-show');
                        el.classList.remove('task-hide');
                    },0);
                    db_toggle_task(parseInt(el.dataset['key']), status);
                } 
            }

            

            return function(el, event){
                 //set data-status
                el.dataset['status'] = el.dataset['status'] == "0" ? 1:0;
                //hide el
                el.classList.remove('task-show');

                el.classList.add('task-hide');

                function callback(){
                    
                }
                

                let x = handleTransition.bind(null, el, callback)

                // match the listener function for removal.
                rl = removeListener.bind(null, el, x);

                
                el.addEventListener('transitionend', x);
            }
        })()

        
        document.addEventListener('click',hideDropdown);
        document.querySelector("button").addEventListener("click", addTask);
        document.querySelector("form").addEventListener('submit', form)

        const inputListener = function(e){
            if(e.target.matches("[type='checkbox'].task-item-checkbox")){
                toggle_task(e.target.closest(".card"));
            }
        }


        document.addEventListener('input', inputListener);


        updateList("progress", modify_number_of_tasks);
        updateList("completed", modify_number_of_completed);
        return ()=>{
            document.removeEventListener('click',hideDropdown);
            document.querySelector("button").removeEventListener("click", addTask);
            document.querySelector("form").removeEventListener('submit', form)
            document.removeEventListener('input',inputListener);
        }
    }



    function render(){
        return `<div class='project'>
        
        <div class='project-name'>
            <a href="/" data-link>
                <svg class="project-back" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </a>
            <!--<svg id="project-name-logo" width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 24H36L30 42L18 6L12 24H4" stroke="#E1E1E1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg> -->
            <span id="title"></span>

            <div id='settings' class="flex items-center">
                <svg id='settings-logo'  xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
                    <defs>
                      <style>
                        .cls-1 {
                          fill-rule: evenodd;
                        }
                      </style>
                    </defs>
                    <path id="Settings" class="cls-1" d="M453,1433a8,8,0,1,0,8,8A8.01,8.01,0,0,0,453,1433Zm0,13a5,5,0,1,1,5-5A5,5,0,0,1,453,1446Zm19-11h-0.975a18.787,18.787,0,0,0-1.034-2.51l0.687-.68a3.011,3.011,0,0,0,0-4.25l-4.243-4.24a3,3,0,0,0-4.243,0l-0.687.69a18.722,18.722,0,0,0-2.5-1.04V1422a3,3,0,0,0-3-3h-6a3,3,0,0,0-3,3v0.97a18.79,18.79,0,0,0-2.506,1.04l-0.686-.69a3,3,0,0,0-4.243,0l-4.243,4.24a3.011,3.011,0,0,0,0,4.25l0.687,0.68a18.787,18.787,0,0,0-1.034,2.51H434a3,3,0,0,0-3,3v6a3,3,0,0,0,3,3h0.975a18.787,18.787,0,0,0,1.034,2.51l-0.687.68a3.011,3.011,0,0,0,0,4.25l4.243,4.24a3,3,0,0,0,4.243,0l0.686-.69a18.79,18.79,0,0,0,2.506,1.04V1460a3,3,0,0,0,3,3h6a3,3,0,0,0,3-3v-0.97a18.722,18.722,0,0,0,2.5-1.04l0.687,0.69a3,3,0,0,0,4.243,0l4.243-4.24a3.011,3.011,0,0,0,0-4.25l-0.687-.68a18.787,18.787,0,0,0,1.034-2.51H472a3,3,0,0,0,3-3v-6A3,3,0,0,0,472,1435Zm0,9h-3.291a15.857,15.857,0,0,1-2.475,5.99l2.322,2.32-4.242,4.25-2.323-2.33a15.949,15.949,0,0,1-5.991,2.48V1460h-6v-3.29a15.949,15.949,0,0,1-5.991-2.48l-2.323,2.33-4.242-4.25,2.322-2.32a15.857,15.857,0,0,1-2.475-5.99H434v-6h3.291a15.857,15.857,0,0,1,2.475-5.99l-2.322-2.32,4.242-4.25,2.323,2.33a15.949,15.949,0,0,1,5.991-2.48V1422h6v3.29a15.949,15.949,0,0,1,5.991,2.48l2.323-2.33,4.242,4.25-2.322,2.32a15.857,15.857,0,0,1,2.475,5.99H472v6Z" transform="translate(-431 -1419)"/>
                </svg>

                <div id='settings-dropdown'>
                    <ul>
                        <li>
                            <div id="settings-edit" class="settings-content">
                                <svg class="settings-list-logo" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                <span class="settings-text">Edit</span>
                            </div>
                        </li>
                        <li>
                            <div id="settings-delete" class="settings-content">
                                <svg class='settings-list-logo' xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-e</title><path d="M296,64H216a7.91,7.91,0,0,0-8,8V96h96V72A7.91,7.91,0,0,0,296,64Z" style="fill:none"/><path d="M432,96H336V72a40,40,0,0,0-40-40H216a40,40,0,0,0-40,40V96H80a16,16,0,0,0,0,32H97L116,432.92c1.42,26.85,22,47.08,48,47.08H348c26.13,0,46.3-19.78,48-47L415,128h17a16,16,0,0,0,0-32ZM192.57,416H192a16,16,0,0,1-16-15.43l-8-224a16,16,0,1,1,32-1.14l8,224A16,16,0,0,1,192.57,416ZM272,400a16,16,0,0,1-32,0V176a16,16,0,0,1,32,0ZM304,96H208V72a7.91,7.91,0,0,1,8-8h80a7.91,7.91,0,0,1,8,8Zm32,304.57A16,16,0,0,1,320,416h-.58A16,16,0,0,1,304,399.43l8-224a16,16,0,1,1,32,1.14Z"/></svg>
                                <span class="settings-text">Delete</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
              
        </div>

        <div id='add-new'>
            <form>
                <input type='text' placeholder="Add new task"/>
                <button><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ionicons-v5-a</title><line x1="256" y1="112" x2="256" y2="400" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/><line x1="400" y1="256" x2="112" y2="256" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px"/></svg></button>
            </form>
        </div>

        <h4 id="task-indicator" style="border-bottom: 1px solid rgb(153, 151, 151);font-weight: 400;padding-bottom: 7px;"></h4>
        <div id="task-progress" class='task-list' data-status="progress">

        </div>

        <h4 id="completed-indicator" style="border-bottom: 1px solid rgb(153, 151, 151);font-weight: 400;padding-bottom: 7px;margin-top: 3rem;"></h4>
        <div id="task-completed" class='task-list' data-status='completed'>
            
        </div>
    </div>
    
    <script id="template-progress-card" type="text/template">
        <label class="checkbox-container">
            <input class="task-item-checkbox" type='checkbox'>
            <span class="checkmark"></span>
        </label>
        <span class="task-description"></span>
    </script>

    <script id="template-completed-card" type="text/template">
        <label class="checkbox-container">
            <input class="task-item-checkbox" type='checkbox' checked='true'>
            <span class="checkmark"></span>
        </label>
        <span class="task-description"></span>
    </script>
    
    `
    }

    return {
        enter,
        render
    }



})());



;// CONCATENATED MODULE: ./client/static/js/views/404.js
/* harmony default export */ const _404 = ((function(){
    function enter(){

    }

    function render(){
        return "404";
    }

    return {enter,render}
})());
;// CONCATENATED MODULE: ./client/static/js/app.js




// register service worker

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js')
    .then((reg) => {
    }).catch((error) => {
      // registration failed
      console.log('Registration failed with ' + error);
    });
}


const root = document.getElementById("root");

const app = {
    route: null,
    exit: null
}

const router = {
    routes: [],
    handleRoute: async function(){
        if(app.exit) app.exit();
        let params = []

        app.route = this.routes.find(function(element){
            params = location.pathname.match(element.path);
            return params;
        })
        if(app.route){
            params = Object.fromEntries(params.slice(1).map( (item, index) =>{
                return [app.route.params[index], item]
            }))
    
            root.innerHTML = app.route.view.render();
            app.exit = app.route.view.enter(params);
        }else{
            root.innerHTML = _404.render();
            app.exit = _404.enter(params);
        }
    },
    addRoute: function (path, view){
        let regpath = new RegExp('^' + path.replace(/\//g,"\\/").replace(/:(\w+)/g,"(.+)") + "\\/?$");
        let params = [...path.matchAll(/:(\w+)/g)].map((el)=>{
            return el[1];
        })

        this.routes.push({path:regpath, view, params: params.length ? params : false});
    },
    navigateTo: function(path){
        history.pushState(null,null,path);
        this.handleRoute();
    }

}


document.body.addEventListener('click',function(e){
    let link = e.target.closest("[data-link]")
    if (link) {
        e.preventDefault();
        router.navigateTo(link.getAttribute('href'))
    }
})
window.addEventListener('popstate', router.handleRoute.bind(router));

router.addRoute("/", main);
router.addRoute("/project/:name",project);

router.handleRoute();

/******/ })()
;