import DB from '../database/indexedDB'
export default (function () {

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
            DB.start(function(db){
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

            DB.start(function(db){
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
})()