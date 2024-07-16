import { Canvas } from 'react-three-fiber';
import { Suspense } from 'react';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Heading, Center } from '@chakra-ui/react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  
  return <primitive object={scene} />;
}

function ClassroomModel() {

  return (
    <div style={{ height: '100vh', margin:'10em' }}>
        <Center>
          <Heading as="h1" size="xl">EduAIx - The AI based Education System</Heading>
        </Center>
      <Canvas camera={{ position: [0, 1, 3], fov: 60 }}>
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 50, 0]} angle={0.6} penumbra={1} />
        <Suspense fallback={null}>
          <Model url="classroom/scene.gltf" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default ClassroomModel