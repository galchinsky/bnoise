window.onload = function () {

    function getRandomArbitary(min, max) {
        return Math.random() * (max - min) + min;
    }

    b2AABB  = Box2D.Collision.b2AABB;
    b2World = Box2D.Dynamics.b2World;
    b2Vec2 = Box2D.Common.Math.b2Vec2;
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    b2Body = Box2D.Dynamics.b2Body;
    b2BodyDef = Box2D.Dynamics.b2BodyDef;
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
    b2ContactListener = Box2D.Dynamics.b2ContactListener;

    var world;
    var audio;
    var playClick;

    var interval = 30;

    init = function() {
        initAudio();
        buildWorld();
        initDraw();
     
        window.setInterval(update, 1000 / interval);
    };

    buildWorld = function() {
        world = new b2World(new b2Vec2(0, 10), true);

        var createGround = function (x, y, w, h) {
            var fixDef = new b2FixtureDef();
            fixDef.density = 0.0;
            fixDef.friction = 0.0;
            fixDef.restitution = 1.0;     

            var bodyDef = new b2BodyDef();            
            bodyDef.type = b2Body.b2_staticBody;
        
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(w, h);
            bodyDef.position.Set(x+w/2, y+h/2);
            return world.CreateBody(bodyDef).CreateFixture(fixDef);
        };
        createGround(0, 0, 800, 10);
        createGround(0, 0, 10, 600);
        var bottom = createGround(0, 100-10, 800, 10);
        createGround(400-10, 0, 10, 600);


        var createBall = function(x, y, r, px, py) {
            var fixDef = new b2FixtureDef();
            fixDef.density = 1.0;
            fixDef.friction = 0.0;
            fixDef.restitution = 1.0;  

            var bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = x;
            bodyDef.position.y = y;
            
            fixDef.shape = new b2CircleShape(r);
            var ball = world.CreateBody(bodyDef).CreateFixture(fixDef);
            ball.GetBody().ApplyImpulse(new b2Vec2(px, py), ball.GetBody().GetWorldCenter());
            return ball;
        };

        for (var i = 0; i < 200; ++i) {
            var x = getRandomArbitary(10, 300);
            var y = getRandomArbitary(10, 50);
            var r = 3;
            var px = getRandomArbitary(-2000, 2000);
            var py = getRandomArbitary(-2000, 2000);
            var ball = createBall(x, y, r, px, py);
        }      

        var listener = new b2ContactListener;
        listener.BeginContact = function(contact) {
            // console.log(contact.GetFixtureA().GetBody().GetUserData());
        };
        listener.EndContact = function(contact) {
            if (contact.GetFixtureA() === bottom || contact.GetFixtureB() === bottom) {
                playClick();
            }
        };
        listener.PostSolve = function(contact, impulse) {
        };
        listener.PreSolve = function(contact, oldManifold) {

        };
        world.SetContactListener(listener); 

    };

    initDraw = function() {
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("main").getContext("2d"));
        debugDraw.SetDrawScale(1.0);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);   
    };

    initAudio = function() {
        //try {
        var clickSound = null;
        // Fix up prefixing
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audio = new AudioContext();
        
        var url = 'click.wav';
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        
        request.onload = function() {
            audio.decodeAudioData(request.response, function(buffer) {
                clickSound = buffer;
            }, function(){});
        };
        request.send();
        
        playClick = function () {
            var source = audio.createBufferSource();
            source.buffer = clickSound;             
            source.connect(audio.destination);    
            setTimeout(function() {source.start(0);}, getRandomArbitary(0, 1000/interval));                        
        };

        //}

        //catch(e) {
        //    alert('Web Audio API is not supported in this browser');
        //}
    };
 
    update = function() {
        world.Step(1/interval, 10, 10);
        world.DrawDebugData();
        world.ClearForces();      
    };

    init();

};
