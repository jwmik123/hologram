uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

void main(){

    vec2 smokeUv = vUv;
    smokeUv.x *= 0.01;
    smokeUv.y *= 4.;
    smokeUv.y += uTime * 0.3;

    // Smoke
    float smoke = texture(uPerlinTexture, smokeUv).r -.06;

    // Remap
    smoke = smoothstep(0.4, 1., smoke);


    // Edges
    // smoke *= smoothstep(0., .1, vUv.x);
    // smoke *= smoothstep(1., .9, vUv.x);
    // smoke *= smoothstep(0., .1, vUv.y);
    // smoke *= smoothstep(1., .4, vUv.y);

    gl_FragColor = vec4(.44,.75,1., smoke);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
