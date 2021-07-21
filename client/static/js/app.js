import main from './views/main'
import project from './views/project'
import not_found from './views/404';

// register service worker
console.log("Hey there pretty 😘")
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
            // 404 Page
            root.innerHTML = not_found.render();
            app.exit = not_found.enter(params);
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
