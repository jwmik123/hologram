varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

#include ../includes/random2D.glsl;

void main () {  
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Glitch
    float glitchTime = uTime - modelPosition.y;
    float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
    glitchStrength /= 3.;
    glitchStrength  = smoothstep(.3,1.,glitchStrength);
    glitchStrength *= .15;
    modelPosition.x += (random2D(vec2(modelPosition.xz + uTime)) - .5) * glitchStrength;
    modelPosition.z += (random2D(vec2(modelPosition.zx + uTime)) - .5) * glitchStrength;

    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
}

