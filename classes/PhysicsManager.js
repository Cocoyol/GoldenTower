/**
 * Gestor de física usando Matter.js
 */
class PhysicsManager {
    constructor(width, height) {
        // Crear motor de física
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Desactivar gravedad (movimiento en línea recta)
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        
        // Dimensiones del escenario con buffer
        this.width = width;
        this.height = height;
        this.buffer = 200; // Margen fuera de pantalla
        
        // Listas de cuerpos
        this.projectileBodies = [];
        this.enemyBodies = [];
        
        // Configurar detección de colisiones
        this.setupCollisionDetection();
    }

    /**
     * Configura la detección de colisiones
     */
    setupCollisionDetection() {
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            const pairs = event.pairs;
            
            for (const pair of pairs) {
                const { bodyA, bodyB } = pair;
                
                // Verificar si es una colisión entre proyectil y enemigo
                const isProjectileA = bodyA.label === 'projectile';
                const isProjectileB = bodyB.label === 'projectile';
                const isEnemyA = bodyA.label === 'enemy';
                const isEnemyB = bodyB.label === 'enemy';
                
                if ((isProjectileA && isEnemyB) || (isProjectileB && isEnemyA)) {
                    // Marcar la colisión
                    if (this.onCollision) {
                        this.onCollision(bodyA, bodyB);
                    }
                }
            }
        });
    }

    /**
     * Crea un cuerpo de proyectil
     */
    createProjectileBody(x, y, vertices, radius = null) {
        let body;
        
        if (radius) {
            // Círculo
            body = Matter.Bodies.circle(x, y, radius, {
                label: 'projectile',
                restitution: 0.8,
                friction: 0.01,
                density: 0.01,
                frictionAir: 0.001
            });
        } else {
            // Polígono
            body = Matter.Bodies.fromVertices(x, y, vertices, {
                label: 'projectile',
                restitution: 0.8,
                friction: 0.01,
                density: 0.01,
                frictionAir: 0.001
            });
        }
        
        Matter.World.add(this.world, body);
        this.projectileBodies.push(body);
        
        return body;
    }

    /**
     * Crea un cuerpo de enemigo
     */
    createEnemyBody(x, y, vertices) {
        const body = Matter.Bodies.fromVertices(x, y, vertices, {
            label: 'enemy',
            restitution: 0.6,
            friction: 0.02,
            density: 0.005,
            frictionAir: 0.002
        });
        
        // Establecer velocidad descendente
        Matter.Body.setVelocity(body, { x: 0, y: 0.5 });
        
        Matter.World.add(this.world, body);
        this.enemyBodies.push(body);
        
        return body;
    }

    /**
     * Aplica una fuerza al proyectil
     */
    launchProjectile(body, forceX, forceY) {
        Matter.Body.setVelocity(body, { x: forceX, y: forceY });
    }

    /**
     * Actualiza el motor de física
     */
    update() {
        Matter.Engine.update(this.engine, 1000 / 60);
        
        // Limpiar cuerpos fuera del escenario (con buffer)
        this.cleanupBodies();
    }

    /**
     * Limpia cuerpos que están fuera del escenario
     */
    cleanupBodies() {
        const buffer = this.buffer;
        
        // Limpiar proyectiles
        for (let i = this.projectileBodies.length - 1; i >= 0; i--) {
            const body = this.projectileBodies[i];
            const pos = body.position;
            
            if (pos.x < -buffer || pos.x > this.width + buffer ||
                pos.y < -buffer || pos.y > this.height + buffer) {
                Matter.World.remove(this.world, body);
                this.projectileBodies.splice(i, 1);
            }
        }
        
        // Limpiar enemigos
        for (let i = this.enemyBodies.length - 1; i >= 0; i--) {
            const body = this.enemyBodies[i];
            const pos = body.position;
            
            if (pos.x < -buffer || pos.x > this.width + buffer ||
                pos.y < -buffer || pos.y > this.height + buffer) {
                Matter.World.remove(this.world, body);
                this.enemyBodies.splice(i, 1);
            }
        }
    }

    /**
     * Elimina un cuerpo específico
     */
    removeBody(body) {
        Matter.World.remove(this.world, body);
        
        // Eliminar de las listas
        let index = this.projectileBodies.indexOf(body);
        if (index > -1) {
            this.projectileBodies.splice(index, 1);
        }
        
        index = this.enemyBodies.indexOf(body);
        if (index > -1) {
            this.enemyBodies.splice(index, 1);
        }
    }

    /**
     * Verifica si un cuerpo está casi estático
     */
    isBodyStatic(body, threshold = 0.1) {
        const velocity = body.velocity;
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        return speed < threshold;
    }

    /**
     * Limpia todos los cuerpos
     */
    clear() {
        Matter.World.clear(this.world);
        this.projectileBodies = [];
        this.enemyBodies = [];
    }
}
