/**
 * Clase que representa un enemigo con propulsión autónoma
 */
class Enemy {
    constructor(x, y, targetX, targetY, size = 30) {
        this.initializeState(x, y, targetX, targetY, size);
    }

    /**
     * Inicializa o reinicia las propiedades del enemigo
     */
    initializeState(x, y, targetX, targetY, size = 30) {
        this.x = x;
        this.y = y;
        this.size = size;

        // Punto objetivo (con variación aleatoria del ±10% del centro horizontal)
        this.targetX = targetX;
        this.targetY = targetY;

        // Calcular orientación inicial hacia el objetivo
        const headingAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);

        // Salud (fija, para futuras expansiones)
        this.health = 100;

        // Factor de peso (afecta masa y color)
        // Valor entre 0.5 y 1.5, donde mayor = más pesado y oscuro
        this.weightFactor = Utils.random(0.8, 4);

        // Calcular masa basada en tamaño y factor de peso
        this.mass = (this.size / 30) * this.weightFactor * 0.01;

        // Color basado en el peso (más oscuro = más pesado)
        this.color = this.calculateColorFromWeight();

        // Generar polígono irregular (4-8 vértices)
        const sides = Utils.randomInt(4, 8);
        this.vertices = Utils.generateIrregularPolygon(
            sides,
            this.size * 0.7,
            this.size * 1.2,
            0,
            0
        );

        // Rotación inicial apuntando al objetivo
        this.rotation = headingAngle;

        // Velocidad angular (rotación) - aleatoria para cada enemigo
        // Menor velocidad angular = giros más lentos
        this.angularVelocity = Utils.random(0.01, 0.03);

        // Factor de velocidad de propulsión (variación pequeña)
        this.thrustFactor = Utils.random(0.4, 0.6);
        this.thrustPower = 0.00001 * this.thrustFactor; // Fuerza de propulsión base

        // Dirección del frente (ángulo hacia donde apunta)
        this.frontAngle = headingAngle;

        // Física
        this.physicsBody = null;

        // Estado
        this.isDestroyed = false;
        this.isActive = false;
    }

    /**
     * Calcula el color basado en el peso
     * Más pesado = más oscuro (gris oscuro)
     * Más liviano = más claro (gris claro)
     */
    calculateColorFromWeight() {
        // Mapear weightFactor (0.5-1.5) a valores de gris (180-80)
        // 180 = gris claro (#B4B4B4), 80 = gris oscuro (#505050)
        const grayValue = Math.floor(Utils.map(this.weightFactor, 0.5, 1.5, 180, 80));
        const hex = grayValue.toString(16).padStart(2, '0');
        return `#${hex}${hex}${hex}`;
    }

    /**
     * Crea el cuerpo físico del enemigo
     */
    createPhysicsBody(physicsManager) {
        // Convertir vértices locales a absolutos
        const absoluteVertices = this.vertices.map(v => ({
            x: this.x + v.x,
            y: this.y + v.y
        }));

        this.physicsBody = physicsManager.createEnemyBody(
            this.x,
            this.y,
            absoluteVertices,
            this.mass,
            this.angularVelocity
        );

        if (this.physicsBody) {
            Matter.Body.setAngle(this.physicsBody, this.rotation);
        }
        this.isActive = true;
    }

    /**
     * Actualiza el enemigo
     */
    update() {
        if (!this.physicsBody || !this.isActive) return;

        // Sincronizar con el cuerpo físico
        this.x = this.physicsBody.position.x;
        this.y = this.physicsBody.position.y;
        this.rotation = this.physicsBody.angle;

        // Calcular ángulo deseado hacia el objetivo
        const targetAngle = Math.atan2(this.targetY - this.y, this.targetX - this.x);

        // Calcular diferencia angular más corta
        let angleDiff = targetAngle - this.rotation;

        // Normalizar el ángulo a [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Aplicar rotación gradual usando la velocidad angular
        const maxRotation = this.angularVelocity;
        const rotationAmount = Utils.clamp(angleDiff, -maxRotation, maxRotation);

        // Establecer velocidad angular en el cuerpo físico
        Matter.Body.setAngularVelocity(this.physicsBody, rotationAmount);

        // Aplicar propulsión en la dirección del frente
        const thrustX = Math.cos(this.rotation) * this.thrustPower * this.mass;
        const thrustY = Math.sin(this.rotation) * this.thrustPower * this.mass;

        Matter.Body.applyForce(this.physicsBody, this.physicsBody.position, {
            x: thrustX,
            y: thrustY
        });

        // Actualizar el ángulo del frente (para la flecha indicadora)
        this.frontAngle = this.rotation;
    }

    /**
     * Dibuja el enemigo
     */
    render(ctx, showDirectionArrow = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Dibujar polígono irregular
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // Dibujar flecha indicadora de dirección (roja)
        if (showDirectionArrow) {
            const arrowLength = this.size * 0.8;
            const arrowWidth = this.size * 0.3;

            ctx.fillStyle = '#FF0000';
            ctx.strokeStyle = '#880000';
            ctx.lineWidth = 1;

            ctx.beginPath();
            // Punta de la flecha
            ctx.moveTo(arrowLength, 0);
            // Lado derecho
            ctx.lineTo(arrowLength * 0.5, arrowWidth);
            // Base derecha
            ctx.lineTo(arrowLength * 0.5, arrowWidth * 0.4);
            // Base izquierda
            ctx.lineTo(-arrowLength * 0.3, arrowWidth * 0.4);
            ctx.lineTo(-arrowLength * 0.3, -arrowWidth * 0.4);
            // Base derecha (otro lado)
            ctx.lineTo(arrowLength * 0.5, -arrowWidth * 0.4);
            // Lado izquierdo
            ctx.lineTo(arrowLength * 0.5, -arrowWidth);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Verifica si está fuera del escenario
     */
    isOutOfBounds(stage, extraBuffer = 0) {
        const margin = stage.getMargin();
        const horizontalMargin = Math.max(margin.left, margin.right);
        const verticalMargin = Math.max(margin.top, margin.bottom);
        const buffer = Math.max(extraBuffer, Math.max(horizontalMargin, verticalMargin));
        return stage.isOutsideStage(this.x, this.y, buffer);
    }

    /**
     * Marca el enemigo como destruido
     */
    destroy() {
        this.isDestroyed = true;
        this.isActive = false;
    }

    /**
     * Resetea el enemigo para reutilización (pool)
     */
    reset(x, y, targetX, targetY, size) {
        this.initializeState(x, y, targetX, targetY, size);
    }
}

/**
 * Pool de enemigos para optimizar creación/destrucción
 */
class EnemyPool {
    constructor(initialSize = 20) {
        this.pool = [];
        this.active = [];

        // Pre-crear enemigos
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new Enemy(0, 0, 0, 0, 30));
        }
    }

    /**
     * Obtiene un enemigo del pool o crea uno nuevo
     */
    acquire(x, y, targetX, targetY, size, physicsManager) {
        let enemy;

        if (this.pool.length > 0) {
            // Reutilizar enemigo del pool
            enemy = this.pool.pop();
            enemy.reset(x, y, targetX, targetY, size);
        } else {
            // Crear nuevo enemigo si el pool está vacío
            enemy = new Enemy(x, y, targetX, targetY, size);
        }

        // Crear cuerpo físico
        enemy.createPhysicsBody(physicsManager);

        // Agregar a lista de activos
        this.active.push(enemy);

        return enemy;
    }

    /**
     * Devuelve un enemigo al pool
     */
    release(enemy, physicsManager) {
        // Remover de activos
        const index = this.active.indexOf(enemy);
        if (index > -1) {
            this.active.splice(index, 1);
        }

        // Remover cuerpo físico
        if (enemy.physicsBody) {
            physicsManager.removeBody(enemy.physicsBody);
            enemy.physicsBody = null;
        }

        // Marcar como inactivo
        enemy.isActive = false;
        enemy.isDestroyed = true;

        // Devolver al pool
        this.pool.push(enemy);
    }

    /**
     * Limpia todos los enemigos activos
     */
    clear(physicsManager) {
        // Devolver todos los activos al pool
        while (this.active.length > 0) {
            this.release(this.active[0], physicsManager);
        }
    }

    /**
     * Obtiene todos los enemigos activos
     */
    getActive() {
        return this.active;
    }
}
