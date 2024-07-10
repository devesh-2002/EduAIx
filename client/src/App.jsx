import ClassroomModel from "./components/classroomModel";
import { ChakraProvider,Heading, Center,Text} from '@chakra-ui/react'
function App() {
  return (
    <div>
      <Heading><Center>EduAIx</Center></Heading>
      <ClassroomModel />
    </div>
    );
}

export default App;
