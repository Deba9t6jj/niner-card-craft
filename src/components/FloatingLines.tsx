import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './FloatingLines.css';

export interface FloatingLinesProps {
  linesGradient?: string[];
  enabledWaves?: [boolean, boolean, boolean];
  lineCount?: number;
  lineDistance?: number;
  topWavePosition?: number;
  middleWavePosition?: number;
  bottomWavePosition?: number;
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: string;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  
  uniform float iTime;
  uniform vec3 iResolution;
  uniform vec2 iMouse;
  uniform float bendInfluence;
  uniform vec2 parallaxOffset;
  
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  
  uniform bool enableTop;
  uniform bool enableMiddle;
  uniform bool enableBottom;
  
  uniform float lineCount;
  uniform float lineDistance;
  uniform float topPos;
  uniform float middlePos;
  uniform float bottomPos;
  uniform float speed;
  uniform float bendRadius;
  uniform float bendStrength;
  
  varying vec2 vUv;
  
  float wave(float x, float freq, float speed, float phase) {
    return sin(x * freq + iTime * speed + phase);
  }
  
  float line(vec2 uv, float offset, float freq, float speed, float phase, float thickness) {
    float y = uv.y + parallaxOffset.y * 0.1;
    float x = uv.x + parallaxOffset.x * 0.1;
    
    float w = wave(x, freq, speed, phase) * 0.05;
    float dist = abs(y - offset - w);
    
    // Mouse bend effect
    if (bendInfluence > 0.0) {
      vec2 mouseNorm = iMouse / iResolution.xy;
      float mouseDist = distance(vec2(x, y), mouseNorm);
      if (mouseDist < bendRadius) {
        float bendAmount = (1.0 - mouseDist / bendRadius) * bendStrength * bendInfluence;
        dist = max(dist - bendAmount * 0.02, 0.0);
      }
    }
    
    return smoothstep(thickness, 0.0, dist);
  }
  
  void main() {
    vec2 uv = vUv;
    vec3 col = vec3(0.0);
    float alpha = 0.0;
    
    float thickness = 0.003;
    float freq = 3.0;
    
    // Draw multiple lines for each wave group
    for (float i = 0.0; i < 8.0; i++) {
      if (i >= lineCount) break;
      
      float offset = i * lineDistance;
      
      if (enableTop) {
        float l = line(uv, topPos + offset, freq, speed, i * 0.5, thickness);
        col += color1 * l * (1.0 - i * 0.1);
        alpha = max(alpha, l * (1.0 - i * 0.1));
      }
      
      if (enableMiddle) {
        float l = line(uv, middlePos + offset, freq * 1.2, speed * 0.8, i * 0.7 + 1.0, thickness);
        col += color2 * l * (1.0 - i * 0.1);
        alpha = max(alpha, l * (1.0 - i * 0.1));
      }
      
      if (enableBottom) {
        float l = line(uv, bottomPos + offset, freq * 0.9, speed * 1.1, i * 0.3 + 2.0, thickness);
        col += color3 * l * (1.0 - i * 0.1);
        alpha = max(alpha, l * (1.0 - i * 0.1));
      }
    }
    
    gl_FragColor = vec4(col, alpha * 0.8);
  }
`;

const hexToRgb = (hex: string): THREE.Vector3 => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return new THREE.Vector3(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
  return new THREE.Vector3(1, 1, 1);
};

export default function FloatingLines({
  linesGradient = ['#0066ff', '#00ccff', '#00ffcc'],
  enabledWaves = [true, true, true],
  lineCount = 5,
  lineDistance = 0.02,
  topWavePosition = 0.75,
  middleWavePosition = 0.5,
  bottomWavePosition = 0.25,
  animationSpeed = 1.0,
  interactive = true,
  bendRadius = 0.3,
  bendStrength = 1.0,
  mouseDamping = 0.1,
  parallax = true,
  parallaxStrength = 0.05,
  mixBlendMode = 'screen'
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetMouseRef = useRef(new THREE.Vector2());
  const currentMouseRef = useRef(new THREE.Vector2());
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new THREE.Vector2());
  const currentParallaxRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      premultipliedAlpha: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      iMouse: { value: new THREE.Vector2() },
      bendInfluence: { value: 0 },
      parallaxOffset: { value: new THREE.Vector2() },
      color1: { value: hexToRgb(linesGradient[0] || '#0066ff') },
      color2: { value: hexToRgb(linesGradient[1] || '#00ccff') },
      color3: { value: hexToRgb(linesGradient[2] || '#00ffcc') },
      enableTop: { value: enabledWaves[0] },
      enableMiddle: { value: enabledWaves[1] },
      enableBottom: { value: enabledWaves[2] },
      lineCount: { value: lineCount },
      lineDistance: { value: lineDistance },
      topPos: { value: topWavePosition },
      middlePos: { value: middleWavePosition },
      bottomPos: { value: bottomWavePosition },
      speed: { value: animationSpeed },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const setSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height, false);
      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(setSize) : null;
    if (ro && containerRef.current) {
      ro.observe(containerRef.current);
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();
      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;
      
      if (parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current.set(offsetX * parallaxStrength, offsetY * parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    if (interactive) {
      renderer.domElement.addEventListener('pointermove', handlePointerMove);
      renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    }

    let raf = 0;
    const renderLoop = () => {
      uniforms.iTime.value = clock.getElapsedTime();
      
      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);
        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }
      
      if (parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }
      
      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(raf);
      if (ro && containerRef.current) {
        ro.disconnect();
      }
      if (interactive) {
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topWavePosition,
    middleWavePosition,
    bottomWavePosition,
    animationSpeed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength
  ]);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
      style={{
        mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode']
      }}
    />
  );
}
