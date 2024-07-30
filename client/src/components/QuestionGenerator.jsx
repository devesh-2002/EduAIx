import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, useToast, VStack, StackDivider, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

function QuestionForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [pdfFile, setPdfFile] = useState(null);
    const toast = useToast();

    const onSubmit = (data) => {
        console.log('Form Data:', data);
        console.log('PDF File:', pdfFile);

        toast({
            title: 'Form Submitted',
            description: 'Your form data has been submitted successfully.',
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
    };

    return (
        <Box maxW="xl" mx="auto" p={6} borderWidth={1} my="5"borderRadius="lg" boxShadow="lg" bg="white">
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
    );
}

export default QuestionForm;
