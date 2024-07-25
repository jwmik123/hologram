uniform float uTime;
uniform sampler2D uPerlinTexture;
uniform vec2 uMouse;

uniform float uTaper; // Add this uniform for cone height control
uniform float uRadius;    // Add this uniform for cone radius

varying vec2 vUv;

// Math PI
const float PI = 3.14159265359;

void main() {


    // Bend the plane into a cylindrical shape
    float angle = position.x * 2.0 * PI / uRadius; // Assuming 'x' is the axis to wrap around
    vec3 newPosition;
    newPosition.x = cos(angle) * uRadius;
    newPosition.z = sin(angle) * uRadius;
    
    // Apply tapering based on 'y' position
    // 'taperFactor' determines how much the radius changes along the 'y' axis
    float taper = mix(0.8, uTaper, position.y);
    newPosition.x *= taper;
    newPosition.z *= taper;

    // Keep 'y' position unchanged
    newPosition.y = position.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

    vUv = uv;
}
