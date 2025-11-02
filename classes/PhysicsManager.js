/**
 * Gestor de física usando Matter.js
 */
class PhysicsManager {
    constructor(stage) {
        // Crear motor de física
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Gravedad desactivada - los enemigos usan propulsión autónoma
        // y los proyectiles se mueven en trayectorias lineales
        this.engine.gravity.y = 0;
        this.engine.gravity.x = 0;
        
        this.stage = stage;
        
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
     * Crea un cuerpo de proyectil con masa explícita
     */
    createProjectileBody(x, y, vertices, radius = null, mass = 0.015) {
        let body;
        
        if (radius) {
            // Círculo
            body = Matter.Bodies.circle(x, y, radius, {
                label: 'projectile',
                restitution: 0.7, // Rebote moderado
                friction: 0.02,
                density: mass, // Usar masa como densidad inicial
                frictionAir: 0.001
            });
        } else {
            // Polígono
            body = Matter.Bodies.fromVertices(x, y, vertices, {
                label: 'projectile',
                restitution: 0.7, // Rebote moderado
                friction: 0.02,
                density: mass, // Usar masa como densidad inicial
                frictionAir: 0.001
            });
        }
        
        // Establecer masa explícitamente para garantizar interacción física correcta
        Matter.Body.setMass(body, mass);
        
        Matter.World.add(this.world, body);
        this.projectileBodies.push(body);
        
        return body;
    }

    /**
     * Crea un cuerpo de enemigo con propulsión autónoma
     */
    createEnemyBody(x, y, vertices, mass = 0.01, angularVelocity = 0.02) {
        const body = Matter.Bodies.fromVertices(x, y, vertices, {
            label: 'enemy',
            restitution: 0.6,
            friction: 0.05, // Fricción moderada para resistencia
            density: mass,
            frictionAir: 0.002, // Resistencia del aire baja
            inertia: Infinity // Evita rotación excesiva por colisiones
        });
        
        // Establecer masa explícitamente
        Matter.Body.setMass(body, mass);
        
        // No establecer velocidad inicial - el enemigo usará propulsión
        
        Matter.World.add(this.world, body);
        this.enemyBodies.push(body);
        
        return body;
    }

    /**
     * Verifica si un conjunto de vértices puede colocarse sin colisionar con enemigos activos
     */
    canPlaceEnemy(x, y, vertices, rotation = 0) {
        if (this.enemyBodies.length === 0) {
            return true;
        }

        const tempBody = Matter.Bodies.fromVertices(x, y, vertices, {
            inertia: Infinity
        });

        // Alinear el cuerpo temporal con la rotación esperada
        Matter.Body.setAngle(tempBody, rotation);
        Matter.Body.setPosition(tempBody, { x, y });

        for (const enemyBody of this.enemyBodies) {
            // Usar Collision.collides en lugar de SAT.collides (deprecado desde v0.18)
            const collision = Matter.Collision.collides(tempBody, enemyBody);
            if (collision && collision.collided) {
                return false;
            }
        }

        return true;
    }

    /**
     * Aplica una fuerza al proyectil
     */
    launchProjectile(body, forceX, forceY, rotationSpeed = 0.1) {
        Matter.Body.setVelocity(body, { x: forceX, y: forceY });
        Matter.Body.setAngularVelocity(body, rotationSpeed);
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
        // Limpiar proyectiles
        for (let i = this.projectileBodies.length - 1; i >= 0; i--) {
            const body = this.projectileBodies[i];
            const pos = body.position;
            
            if (this.stage.isOutsideStage(pos.x, pos.y)) {
                Matter.World.remove(this.world, body);
                this.projectileBodies.splice(i, 1);
            }
        }
        
        // Limpiar enemigos
        for (let i = this.enemyBodies.length - 1; i >= 0; i--) {
            const body = this.enemyBodies[i];
            const pos = body.position;
            
            if (this.stage.isOutsideStage(pos.x, pos.y)) {
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
     * Notifica al gestor que el escenario cambió de tamaño.
     */
    onStageResized() {
        // Los límites se consultan directamente del escenario, por lo que no se requiere trabajo adicional.
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
