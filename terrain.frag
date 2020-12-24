#version 150 core
// fragment shader for simple terrain application

// per-frame data
layout(std140)                  // standard layout
uniform SceneData {             // like a class name
    mat4 modelViewMatrix, modelViewInverse;
    mat4 projectionMatrix, projectionInverse;
    vec4 normal_map;
    vec4 surface_gradient;
    vec4 fog;
};

// shader settings
uniform sampler2D colorTexture;
uniform sampler2D normalTexture;

// input from vertex shader
in vec3 normal;
in vec3 tangent;
in vec3 bitangent;
in vec2 texcoord;
in vec4 position;

// output to frame buffer
out vec4 fragColor;
           
void main() 
{     
       vec3 N = normalize(normal);
       vec3 L = normalize(vec3(-1, 1, 1));
       vec3 V = normalize(vec3(position)); 
       if (normal_map.a != 0)
       {
          mat3 tbnMatrix = mat3(tangent, bitangent, normal);
          vec3 newNormal = texture(normalTexture, texcoord).rgb*2.0-1.0;
          newNormal = normalize(mat3(tbnMatrix) * newNormal);        
          vec3 T = normalize(tangent);
          vec3 B = normalize(bitangent);
          N = normalize(newNormal);
          L = normalize(vec3(-1,1,1)); // light direction      
       } 
       if (surface_gradient.a != 0)
       {
	   vec3 dp1 = dFdx(V);
           vec3 dp2 = dFdy(V);
           vec2 duv1 = dFdx(texcoord);
           vec2 duv2 = dFdy(texcoord);
           // solve the linear system
           vec3 dp2perp = cross( dp2, N );
           vec3 dp1perp = cross( N, dp1 );
           vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
           vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
           // construct a scale-invariant frame 
           float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
           mat3 tbnMatrix = mat3( T * invmax, B * invmax, N );
           vec3 map = texture(normalTexture, texcoord).xyz;
           map = map * 255.0/127.0 - 128.0/127.0;
           N = normalize(mat3(tbnMatrix) * map);
       }
       float diff = max(0., dot(N,L));  // diffuse lighting
       // color from texture and diffuse
       vec3 color = texture(colorTexture, texcoord).rgb *diff;
       if (fog.a != 0)
          color = mix(fog.rgb, color, exp2(.005 * position.z));
       // final color
       fragColor = vec4(color, 1);
}
