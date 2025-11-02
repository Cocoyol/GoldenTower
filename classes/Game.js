/**
 * Clase principal del juego
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configurar tamaño del canvas
        this.setupCanvas();
        
        // Estado del juego
        this.isRunning = false;
        this.isPaused = false;
        
        // Elementos del juego
        this.base = null;
        this.currentProjectile = null;
        this.enemies = [];
        
        // Sistemas
        this.physicsManager = null;
        this.particleSystem = new ParticleSystem();
        this.statistics = new Statistics();
        
        // Sistema de arrastre
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.dragCurrent = { x: 0, y: 0 };
        
        // Timers
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000; // 3 segundos
        this.projectileStaticTimer = 0;
        this.projectileStaticThreshold = 2000; // 2 segundos
        
        // Configurar eventos
        this.setupEvents();
        
        // Loop de animación
        this.lastTime = 0;
        this.animationId = null;
    }

    /**
     * Configura el tamaño del canvas
     */
    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    /**
     * Configura los eventos del juego
     */
    setupEvents() {
        // Mouse down - Iniciar arrastre
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        
        // Mouse move - Arrastrar
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Mouse up - Lanzar
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Resize
        window.addEventListener('resize', () => this.onResize());
    }

    /**
     * Inicia el juego
     */
    start() {
        this.isRunning = true;
        this.statistics.reset();
        
        // Inicializar física
        this.physicsManager = new PhysicsManager(this.width, this.height);
        this.physicsManager.onCollision = (bodyA, bodyB) => this.onCollision(bodyA, bodyB);
        
        // Crear la base en la posición correcta (3/10 desde abajo)
        const baseX = this.width / 2;
        const baseY = this.height * 0.7; // 7/10 desde arriba = 3/10 desde abajo
        this.base = new Base(baseX, baseY);
        
        // Crear el primer proyectil
        this.createNewProjectile();
        
        // Iniciar loop de animación
        this.lastTime = performance.now();
        this.loop();
    }

    /**
     * Detiene el juego
     */
    stop() {
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Limpiar
        this.enemies = [];
        this.currentProjectile = null;
        this.particleSystem.clear();
        
        if (this.physicsManager) {
            this.physicsManager.clear();
        }
    }

    /**
     * Crea un nuevo proyectil
     */
    createNewProjectile() {
        const pos = this.base.getPosition();
        this.currentProjectile = new Projectile(pos.x, pos.y);
        this.projectileStaticTimer = 0;
    }

    /**
     * Genera un enemigo aleatorio
     */
    spawnEnemy() {
        const x = Utils.random(50, this.width - 50);
        const y = -50; // Fuera de la pantalla arriba
        const size = Utils.random(25, 40);
        
        const enemy = new Enemy(x, y, size);
        enemy.createPhysicsBody(this.physicsManager);
        this.enemies.push(enemy);
        
        this.statistics.incrementEnemies();
    }

    /**
     * Maneja colisiones
     */
    onCollision(bodyA, bodyB) {
        this.statistics.incrementCollisions();
        
        // Crear partículas en el punto de colisión
        const posA = bodyA.position;
        const posB = bodyB.position;
        const collisionX = (posA.x + posB.x) / 2;
        const collisionY = (posA.y + posB.y) / 2;
        
        // Emitir partículas desde ambos objetos
        if (this.currentProjectile && this.currentProjectile.physicsBody === bodyA) {
            this.particleSystem.emit(
                collisionX, collisionY,
                this.currentProjectile.color,
                this.currentProjectile.vertices,
                this.currentProjectile.radius,
                this.currentProjectile.shape
            );
        }
    }

    /**
     * Evento mouse down
     */
    onMouseDown(e) {
        if (!this.isRunning || !this.base || !this.currentProjectile || this.currentProjectile.isLaunched) {
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Verificar si el click ocurrió sobre la base para habilitar el arrastre
        if (this.base.containsPoint(x, y)) {
            const basePos = this.base.getPosition();
            this.isDragging = true;
            this.dragStart = { x: basePos.x, y: basePos.y };
            this.dragCurrent = { x, y };
            this.canvas.classList.add('grabbing');
        }
    }

    /**
     * Evento mouse move
     */
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.dragCurrent = { x, y };
    }

    /**
     * Evento mouse up
     */
    onMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.canvas.classList.remove('grabbing');
        
        // Calcular fuerza y dirección
        const basePos = this.base.getPosition(); // Usar siempre el centro de la base como origen
        const dx = basePos.x - this.dragCurrent.x;
        const dy = basePos.y - this.dragCurrent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Mínima distancia para lanzar
        if (distance < 20) {
            return;
        }
        
        // Mapear distancia a fuerza (1-100, luego a velocidad)
        const maxDragDistance = 150;
        const force = Utils.clamp(distance, 0, maxDragDistance);
        const normalizedForce = Utils.map(force, 0, maxDragDistance, 0, 100);
        const velocity = Utils.map(normalizedForce, 0, 100, 0, 15);
        
        // Calcular dirección normalizada
        const angle = Math.atan2(dy, dx);
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        // Lanzar proyectil
        this.currentProjectile.launch(vx, vy, this.physicsManager);
        this.statistics.incrementProjectiles();
    }

    /**
     * Evento resize
     */
    onResize() {
        this.setupCanvas();
        
        if (this.physicsManager) {
            this.physicsManager.width = this.width;
            this.physicsManager.height = this.height;
        }
    }

    /**
     * Actualiza el juego
     */
    update(deltaTime) {
        // Actualizar física
        this.physicsManager.update();
        
        // Actualizar proyectil actual
        if (this.currentProjectile) {
            if (this.currentProjectile.isLaunched) {
                this.currentProjectile.update(this.currentProjectile.physicsBody);
                
                // Generar partículas mientras vuela
                if (Math.random() < 0.3) {
                    this.particleSystem.emit(
                        this.currentProjectile.x,
                        this.currentProjectile.y,
                        this.currentProjectile.color,
                        this.currentProjectile.vertices,
                        this.currentProjectile.radius,
                        this.currentProjectile.shape
                    );
                }
                
                // Verificar si está fuera del escenario
                if (this.currentProjectile.isOutOfBounds(this.width, this.height)) {
                    this.createNewProjectile();
                }
                // Verificar si está estático
                else if (this.currentProjectile.physicsBody && 
                         this.physicsManager.isBodyStatic(this.currentProjectile.physicsBody)) {
                    this.projectileStaticTimer += deltaTime;
                    
                    if (this.projectileStaticTimer >= this.projectileStaticThreshold) {
                        this.createNewProjectile();
                    }
                } else {
                    this.projectileStaticTimer = 0;
                }
            } else {
                this.currentProjectile.update();
            }
        }
        
        // Actualizar enemigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            
            // Eliminar enemigos fuera del escenario
            if (enemy.isOutOfBounds(this.width, this.height)) {
                if (enemy.physicsBody) {
                    this.physicsManager.removeBody(enemy.physicsBody);
                }
                this.enemies.splice(i, 1);
            }
        }
        
        // Spawn de enemigos
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            // Variar el intervalo
            this.enemySpawnInterval = Utils.random(2000, 4000);
        }
        
        // Actualizar partículas
        this.particleSystem.update();
    }

    /**
     * Renderiza el juego
     */
    render() {
        // Limpiar canvas
        this.ctx.fillStyle = '#0a0a15';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dibujar base
        if (this.base) {
            this.base.render(this.ctx);
        }
        
        // Dibujar enemigos
        for (const enemy of this.enemies) {
            enemy.render(this.ctx);
        }
        
        // Dibujar proyectil actual
        if (this.currentProjectile) {
            this.currentProjectile.render(this.ctx);
        }
        
        // Dibujar indicador de arrastre
        if (this.isDragging) {
            this.renderDragIndicator();
        }
        
        // Dibujar partículas
        this.particleSystem.render(this.ctx);
    }

    /**
     * Renderiza el indicador de arrastre
     */
    renderDragIndicator() {
        const basePos = this.base.getPosition();
        // Anclar el indicador al centro de la base para que la referencia visual sea coherente
        const dx = basePos.x - this.dragCurrent.x;
        const dy = basePos.y - this.dragCurrent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) return;
        
        const maxDragDistance = 150;
        const force = Utils.clamp(distance, 0, maxDragDistance);
        const normalizedForce = Math.round(Utils.map(force, 0, maxDragDistance, 0, 100));
        
        this.ctx.save();
        
        // Línea de dirección
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(basePos.x, basePos.y);
        this.ctx.lineTo(this.dragCurrent.x, this.dragCurrent.y);
        this.ctx.stroke();
        
        // Flecha en la dirección opuesta (dirección del lanzamiento)
        const angle = Math.atan2(dy, dx);
        const arrowLength = 30;
        const arrowX = basePos.x + Math.cos(angle) * (distance + 20);
        const arrowY = basePos.y + Math.sin(angle) * (distance + 20);
        
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(
            arrowX - Math.cos(angle - Math.PI / 6) * arrowLength,
            arrowY - Math.sin(angle - Math.PI / 6) * arrowLength
        );
        this.ctx.lineTo(
            arrowX - Math.cos(angle + Math.PI / 6) * arrowLength,
            arrowY - Math.sin(angle + Math.PI / 6) * arrowLength
        );
        this.ctx.closePath();
        this.ctx.fill();
        
        // Mostrar fuerza
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `${normalizedForce}%`,
                    basePos.x,
                    basePos.y - 30
        );
        
        this.ctx.restore();
    }

    /**
     * Loop principal del juego
     */
    loop(currentTime = 0) {
        if (!this.isRunning) return;
        
        // Calcular deltaTime
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Actualizar y renderizar
        this.update(deltaTime);
        this.render();
        
        // Siguiente frame
        this.animationId = requestAnimationFrame((time) => this.loop(time));
    }
}
