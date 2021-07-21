import DB from '../database/indexedDB'

export default (function(){
    function enter(query){
        const project_name = decodeURIComponent(query.name);
        document.querySelector('.project-name').querySelector('#title').innerText = '👽 - ' + project_name;
        
        // initialize project if it isn't yet
        DB.start(function(db){
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

                DB.start(function(db){
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

            DB.start(function(db){
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

                DB.start(function(db){
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

            // main sub-function, this is where the process happens when switching task from "progress" to "completed" vice-versa
            function handleTransition(el){
                let element = el;
                let remover = null;

                function setRemover(fn){
                    remover = fn;
                }
                function removeListener(){
                    el.removeEventListener("transitionend", remover);
                }
                function transition(){
                    let style = window.getComputedStyle(el);
                    
                    if(style.height == "0px" && style.marginBottom == "0px" && style.marginTop == "0px" &&
                      style.marginLeft == "0px" && style.marginRight == "0px"   && style.paddingBottom == "0px"
                      && style.paddingTop == "0px" && style.paddingLeft == "0px" && style.paddingRight == "0px" ){ 
                        removeListener();
                        let status = parseInt(el.dataset['status'])
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
                return {
                    setRemover,
                    removeListener,
                    transition
                }
            }

            

            return function(el, event){
                 //set data-status
                el.dataset['status'] = el.dataset['status'] == "0" ? 1:0;
                
                // hide element
                el.classList.remove('task-show');
                el.classList.add('task-hide');
                
                // prepare the eventlistener and the remover,
                let handle = handleTransition(el);
                let remover = handle.transition;
                handle.setRemover(remover);

                // bind the listener
                el.addEventListener('transitionend', remover);
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



})()


