#version 150 core
// vertex shader for simple terrain demo

// per-frame data
layout(std140)                  // standard layout
uniform SceneData {             // like a class name
    mat4 modelViewMatrix, modelViewInverse;
    mat4 projectionMatrix, projectionInverse;
    vec4 normal_map;  
    vec4 surface_gradient;
    vec4 fog;
};

// per-vertex input
in vec3 vPosition;
in vec3 vNormal;
in vec2 vUV;
in vec3 vTangent;
in vec3 vBitangent;


// output to fragment shader (view space)
out vec3 normal;
out vec3 tangent;
out vec3 bitangent;
out vec2 texcoord;
out vec4 position;

void main() 
{
    position = modelViewMatrix * vec4(vPosition, 1);
    normal = normalize(vNormal * mat3(modelViewInverse));
    texcoord = vUV;
    gl_Position = projectionMatrix * position;
    tangent = normalize(mat3(modelViewMatrix) * vTangent);
    bitangent = normalize(mat3(modelViewMatrix) * vBitangent);
}
