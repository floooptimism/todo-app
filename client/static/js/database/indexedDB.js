export default (function(){
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
})()