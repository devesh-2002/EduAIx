import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  VStack,
  StackDivider,
  Text,
  Flex,
  Spinner,
  List,
  ListItem,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';

function QuestionForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [pdfFile, setPdfFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('form'); // New state to track view
    const toast = useToast();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('n_ques', data.n_ques);
            formData.append('total_marks', data.total_marks);
            formData.append('additional_inst', data.additional_inst);
            if (pdfFile) {
                formData.append('pdf_file', pdfFile);
            }

            const response = await fetch('http://localhost:8000/teacher', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            const formattedResponse = formatResponse(result);
            setResponseMessage(formattedResponse);
            setView('response');
            toast({
                title: 'Success',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false); 
        } catch (error) {
            setResponseMessage('An error occurred while generating the questions.');
            toast({
                title: 'Error',
                description: 'An error occurred while generating the questions.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false); 
        }
    };

    const formatResponse = (response) => {
        return response.split('\n').map((item, index) => {
            if (item.trim()) {
                return item.trim();
            }
            return null;
        }).filter(item => item); 
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(6);

        doc.text('Questions : ', 10, 10);
        doc.setFontSize(5);
        
        if (responseMessage) {
            let y = 10;
            responseMessage.forEach((line, index) => {
                doc.text(line, 5, y);
                y += 5;
            });
        }

        doc.save('response.pdf');
    };

    const formBg = useColorModeValue('white', 'gray.800');
    const containerBg = useColorModeValue('gray.100', 'gray.900');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const responseBg = useColorModeValue('gray.50', 'gray.700');

    return (
        <>
            {loading ? (
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    minH="100vh"
                    bg={containerBg}
                >
                    <Spinner size="xl" color="teal.500" />
                    <Text mt={4} fontSize="lg" fontWeight="semibold">
                        Processing...
                    </Text>
                </Flex>
            ) : (
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    maxW="xl"
                    mx="auto"
                    p={6}
                    borderWidth={1}
                    my="5"
                    borderRadius="lg"
                    boxShadow="lg"
                    bg={formBg}
                    borderColor={borderColor}
                >
                    {view === 'form' && (
                        <Box flex="1" mr={{ md: 6 }} mb={{ base: 6, md: 0 }}>
                            <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
                                Question Generator Form
                            </Text>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <VStack
                                    spacing={6}
                                    align="stretch"
                                    divider={<StackDivider borderColor={borderColor} />}
                                >
                                    <FormControl id="n_ques" isRequired isInvalid={!!errors.n_ques}>
                                        <FormLabel fontWeight="semibold">Number of Questions</FormLabel>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter the number of questions" 
                                            {...register('n_ques', { required: 'This field is required' })}
                                        />
                                    </FormControl>

                                    <FormControl id="total_marks" isRequired isInvalid={!!errors.total_marks}>
                                        <FormLabel fontWeight="semibold">Total Marks</FormLabel>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter the total marks" 
                                            {...register('total_marks', { required: 'This field is required' })}
                                        />
                                    </FormControl>

                                    <FormControl id="additional_inst">
                                        <FormLabel fontWeight="semibold">Additional Instructions</FormLabel>
                                        <Textarea 
                                            placeholder="Enter any additional instructions here" 
                                            {...register('additional_inst')}
                                        />
                                    </FormControl>

                                    <FormControl id="pdf_file" isRequired>
                                        <FormLabel fontWeight="semibold">Upload PDF File</FormLabel>
                                        <Input 
                                            type="file" 
                                            accept=".pdf"
                                            onChange={(e) => setPdfFile(e.target.files[0])}
                                        />
                                    </FormControl>

                                    <Button type="submit" colorScheme="teal" size="lg" mt={4}>
                                        Submit
                                    </Button>
                                </VStack>
                            </form>
                        </Box>
                    )}

                    {view === 'response' && (
                        <Box flex="1" p={4} borderWidth={1} my="5" borderRadius="lg" bg={responseBg} shadow="md">
                            <>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Response:
                                </Text>
                                <Divider my={2} />
                                <List spacing={2}>
                                    {responseMessage.map((item, index) => (
                                        <ListItem key={index}>{item}</ListItem>
                                    ))}
                                </List>
                                <Button mt={4} colorScheme="teal" onClick={downloadPDF}>
                                    Download PDF
                                </Button>
                                <Button mt={4} ml={4} colorScheme="blue" onClick={() => setView('form')}>
                                    Back
                                </Button>
                            </>
                        </Box>
                    )}
                </Flex>
            )}
        </>
    );
}

export default QuestionForm;
