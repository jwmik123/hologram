varying vec3 vPosition;
varying vec3 vNormal;
uniform float uTime;
uniform vec3 uColor;

void main() {

    // normal
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing) normal *= -1.;

    // horizontal stripe pattern
    float stripes = mod((vPosition.y - uTime * 0.02) * 20., 1.);
    stripes = pow(stripes, 3.);

    // Fresnel
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float fresnel = dot(viewDirection, normal) + 1.;
    fresnel = pow(fresnel, 2.);

    // Fall off
    float falloff = smoothstep(.8,0., fresnel);

    // Holographic effect
    float holographic = stripes * fresnel;
    holographic += fresnel * 1.25;
    holographic *= falloff;

    
    
    // Final color
    gl_FragColor = vec4(uColor, holographic);
    // gl_FragColor = vec4(1.0, 1.0, 1.0, fresnel);
    // gl_FragColor = vec4(vNormal, stripes); // Maybe add this for fun effect
    #include <colorspace_fragment>
}