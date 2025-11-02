/**
 * Clase que representa un proyectil
 */
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        
        // Seleccionar forma aleatoria
        this.shapes = ['triangle', 'square', 'pentagon', 'hexagon', 'circle'];
        this.shape = this.shapes[Utils.randomInt(0, this.shapes.length - 1)];
        
        // Color aleatorio
        this.color = Utils.randomColor();
        
        // Tamaño
        this.radius = 20;
        
        // Masa del proyectil (varía con el tamaño y forma)
        // Círculos = más pesados, polígonos = más ligeros según número de lados
        this.calculateMass();
        
        // Rotación
        this.rotation = 0;
        this.rotationSpeed = 0.02; // Rotación lenta inicial
        
        // Estado
        this.isLaunched = false;
        this.isDragging = false;
        
        // Física
        this.physicsBody = null;
        
        // Generar vértices según la forma
        this.generateVertices();
        
        // Efecto glow
        this.glowIntensity = 1;
    }

    /**
     * Calcula la masa del proyectil según su forma
     */
    calculateMass() {
        // Factor base de masa según la forma
        let shapeFactor;
        switch (this.shape) {
            case 'circle':
                shapeFactor = 1.2; // Círculos más densos
                break;
            case 'triangle':
                shapeFactor = 0.8; // Triángulos más ligeros
                break;
            case 'square':
                shapeFactor = 1.0; // Cuadrados equilibrados
                break;
            case 'pentagon':
                shapeFactor = 1.1;
                break;
            case 'hexagon':
                shapeFactor = 1.15;
                break;
            default:
                shapeFactor = 1.0;
        }
        
        // Masa proporcional al tamaño y forma
        // Similar a los enemigos: (tamaño/base) * factor
        this.mass = (this.radius / 20) * shapeFactor * 0.015; // 0.015 para que sea comparable a enemigos
    }

    /**
     * Genera los vértices de la forma
     */
    generateVertices() {
        switch (this.shape) {
            case 'triangle':
                this.vertices = Utils.generatePolygonVertices(3, this.radius);
                break;
            case 'square':
                this.vertices = Utils.generatePolygonVertices(4, this.radius);
                break;
            case 'pentagon':
                this.vertices = Utils.generatePolygonVertices(5, this.radius);
                break;
            case 'hexagon':
                this.vertices = Utils.generatePolygonVertices(6, this.radius);
                break;
            case 'circle':
                this.vertices = null; // Los círculos no necesitan vértices
                break;
        }
    }

    /**
     * Actualiza el proyectil
     */
    update(physicsBody = null) {
        if (physicsBody) {
            // Sincronizar con el cuerpo físico
            this.x = physicsBody.position.x;
            this.y = physicsBody.position.y;
            this.rotation = physicsBody.angle;
            
            // Aumentar velocidad de rotación cuando está lanzado
            if (this.isLaunched) {
                this.rotationSpeed = 0.15;
                this.glowIntensity = 1.5;
            }
        } else {
            // Rotación lenta cuando está en la base
            this.rotation += this.rotationSpeed;
        }
    }

    /**
     * Dibuja el proyectil
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.shape === 'circle') {
            Utils.drawCircleWithGlow(ctx, 0, 0, this.radius, this.color, this.glowIntensity);
        } else {
            Utils.drawPolygonWithGlow(ctx, this.vertices, this.color, this.glowIntensity);
        }
        
        ctx.restore();
    }

    /**
     * Lanza el proyectil
     */
    launch(forceX, forceY, physicsManager) {
        this.isLaunched = true;
        this.rotationSpeed = 0.15;
        
        // Crear cuerpo físico
        if (this.shape === 'circle') {
            this.physicsBody = physicsManager.createProjectileBody(this.x, this.y, null, this.radius, this.mass);
        } else {
            // Convertir vértices locales a coordenadas absolutas para Matter.js
            const absoluteVertices = this.vertices.map(v => ({
                x: this.x + v.x,
                y: this.y + v.y
            }));
            this.physicsBody = physicsManager.createProjectileBody(this.x, this.y, absoluteVertices, null, this.mass);
        }
        
        // Aplicar fuerza
        physicsManager.launchProjectile(this.physicsBody, forceX, forceY);
    }

    /**
     * Verifica si un punto está dentro del proyectil
     */
    containsPoint(px, py) {
        return Utils.pointInCircle(px, py, this.x, this.y, this.radius);
    }

    /**
     * Obtiene la posición inicial
     */
    getInitialPosition() {
        return { x: this.initialX, y: this.initialY };
    }

    /**
     * Verifica si está fuera del escenario
     */
    isOutOfBounds(width, height, buffer = 100) {
        return this.x < -buffer || this.x > width + buffer ||
               this.y < -buffer || this.y > height + buffer;
    }
}
