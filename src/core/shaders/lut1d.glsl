#ifdef GL_ES
precision highp float;
#endif

in vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D lut_tex;
uniform float lut_size;
uniform vec3 domain_min;
uniform vec3 domain_max;

void main(void) {
    vec4 color = texture(textureSampler, vUV);

    float lut_step = 1.0 / lut_size;
    float half_lut_step = 0.5 / lut_size;

    vec3 uvw = vec3(half_lut_step) + clamp(color.rgb, domain_min, domain_max) * (1.0 - lut_step);

    color.r = texture(lut_tex, vec2(uvw.r, 0.16666666)).r;
    color.g = texture(lut_tex, vec2(uvw.g, 0.25)).g;
    color.b = texture(lut_tex, vec2(uvw.b, 0.41666666)).b;

    gl_FragColor = vec4(max(color.rgb, vec3(0.)), color.a);
}
