import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast, VStack, StackDivider, Text, Flex, Spinner, List, ListItem, Divider } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

function QuestionForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [pdfFile, setPdfFile] = useState(null);
    const [responseMessage, setResponseMessage] = useState(null);
    const toast = useToast();
    const [loading, setLoading] = useState(false); 
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
            console.log(result);
            const formattedResponse = formatResponse(result);
            setResponseMessage(formattedResponse);
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
                return <ListItem key={index}>{item.trim()}</ListItem>;
            }
            return null;
        });
    };

    return (
        <>
               {loading ? (
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    minH="100vh"
                    bg="white"
                >
                    <Spinner size="xl" color="teal.500" />
                    <Text mt={4} fontSize="lg" fontWeight="semibold">
                        Processing...
                    </Text>
                </Flex>
            ) : (
                <Flex direction={{ base: 'column', md: 'row' }} maxW="xl" mx="auto" p={6} borderWidth={1} my="5" borderRadius="lg" boxShadow="lg" bg="white">
                    {!responseMessage && (
                        <Box flex="1" mr={{ md: 6 }} mb={{ base: 6, md: 0 }}>
                            <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="center">
                                Question Generator Form
                            </Text>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <VStack spacing={6} align="stretch" divider={<StackDivider borderColor="gray.200" />}>
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

                    {responseMessage && (
                        <Box flex="1" p={4} borderWidth={1} my="5" borderRadius="lg" bg="gray.50" shadow="md">
                            <>
                                <Text fontSize="lg" fontWeight="semibold">
                                    Response:
                                </Text>
                                <Divider my={2} />
                                <List spacing={2}>
                                    {responseMessage}
                                </List>
                            </>
                        </Box>
                    )}
                </Flex>
            )}

        </>
    );
}

export default QuestionForm;
