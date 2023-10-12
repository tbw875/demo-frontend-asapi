import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


describe('App', () => {
    // Test that the handlePostRequest function is called when the user connects their wallet to the dApp
    it('should call handlePostRequest when user connects wallet', () => {
      const mockHandlePostRequest = jest.fn();
      const mockSetAddress = jest.fn();
      const mockUseState = jest.spyOn(React, 'useState');
      mockUseState.mockImplementation((initialValue) => [initialValue, mockSetAddress]);

      render(<App />);

      const connectWalletButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectWalletButton);

      expect(mockHandlePostRequest).toHaveBeenCalled();
    });


    // Test that the handlePostRequest function successfully makes a POST request and displays a success toast message when the response status is 200 and the response data contains an address.
    it('should display success toast message when POST request is successful', async () => {
      // Mock axios post method
      axios.post = jest.fn().mockResolvedValue({
        status: 200,
        data: {
          address: "example_address",
        },
      });

      // Mock toast.success method
      toast.success = jest.fn();

      // Render the App component
      render(<App />);

      // Set the address value
      const addressInput = screen.getByLabelText("Enter Address");
      fireEvent.change(addressInput, { target: { value: "example_address" } });

      // Click the POST button
      const postButton = screen.getByRole("button", { name: "POST" });
      fireEvent.click(postButton);

      // Wait for the axios post method to be called
      await waitFor(() => expect(axios.post).toHaveBeenCalled());

      // Check if toast.success method is called with the correct message
      expect(toast.success).toHaveBeenCalledWith(
        "POST request was successful for address: example_address"
      );
    });


    // Test that the handleGetRequest function successfully makes a GET request and sets the response data
    it('should set response data when handleGetRequest is called', async () => {
      const mockResponse = {
        data: {
          address: "example_address",
          risk: "example_risk",
          // other properties
        },
      };

      axios.get.mockResolvedValueOnce(mockResponse);

      await act(async () => {
        render(<App />);
      });

      const getButton = screen.getByRole("button", { name: "GET" });

      await act(async () => {
        fireEvent.click(getButton);
      });

      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(axios.get).toHaveBeenCalledWith(
        `http://localhost:3001/api/entities/${address}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      expect(screen.getByText("GET request was successful!")).toBeInTheDocument();
      expect(screen.getByText("Data successfully stored in the database")).toBeInTheDocument();
      expect(screen.getByText(JSON.stringify(mockResponse.data, null, 2))).toBeInTheDocument();
    });


    // Test that the ThirdWeb provider is active in the App component
    it('should have the ThirdWeb provider active', () => {
      render(<App />);
      const thirdWebProvider = screen.getByTestId('thirdweb-provider');
      expect(thirdWebProvider).toBeInTheDocument();
    });


    // Test that the error message is displayed when no response is received in the POST request
    it('should display error message when no response is received in POST request', () => {
      // Mock the axios.post function to throw an error without a response
      jest.spyOn(axios, 'post').mockImplementation(() => {
        throw new Error('Request failed');
      });

      // Render the App component
      render(<App />);

      // Trigger the handlePostRequest function
      act(() => {
        fireEvent.click(screen.getByText('POST'));
      });

      // Check if the error message is displayed
      expect(screen.getByText(/Error in POST request/i)).toBeInTheDocument();
    });


    // Test that the theme is set to dark mode in the App component
    it('should set the theme to dark mode', () => {
      // Arrange
      const { container } = render(<App />);
  
      // Act
  
      // Assert
      expect(container.firstChild).toHaveStyle('background-color: #1D3557');
      expect(container.firstChild).toHaveStyle('color: #F1FAEE');
    });


    // Test that an error is thrown when no response is received in the GET request
    it('should throw an error when no response is received in the GET request', () => {
      // Mock axios.get to return a rejected promise without a response
      jest.spyOn(axios, 'get').mockRejectedValueOnce({});

      // Render the App component
      render(<App />);

      // Trigger the handleGetRequest function
      act(() => {
        fireEvent.click(screen.getByText('GET'));
      });

      // Check if the error toast is displayed
      expect(screen.getByText(/Error in GET request/i)).toBeInTheDocument();
    });


    // Test that the address entered in the TextField is stored in the state variable 'address' when the value is changed.
    it('should store the entered address in the state variable 'address' when the value is changed', () => {
      render(<App />);
      const addressInput = screen.getByLabelText('Enter Address');
      const testAddress = '0x1234567890abcdef';
  
      fireEvent.change(addressInput, { target: { value: testAddress } });
  
      expect(addressInput.value).toBe(testAddress);
    });


    // Test that the address is fetched via ThirdWeb and set in the state variable 'address' correctly
    it('should fetch the address via ThirdWeb and set it in the state variable 'address'', () => {
      // Mock the useAddress hook
      jest.mock('@thirdweb-dev/react', () => ({
        useAddress: jest.fn(() => 'mocked_address'),
      }));

      // Render the App component
      render(<App />);

      // Check if the address is set correctly in the state variable 'address'
      expect(screen.getByText(/Address: mocked_address/i)).toBeInTheDocument();
    });


    // Test that the toast.error function is called with the correct message when the POST request is successful but the response format is unexpected.
    it('should call toast.error with the correct message when the POST request is successful but the response format is unexpected', async () => {
      const mockPost = jest.spyOn(axios, 'post').mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      const mockToastError = jest.spyOn(toast, 'error');

      await App();

      expect(mockPost).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('POST request was successful, but unexpected response format.');

      mockPost.mockRestore();
      mockToastError.mockRestore();
    });


    // Test that an error is thrown in the GET request when the address is invalid
    it('should throw an error in the GET request when the address is invalid', async () => {
      const mockAddress = 'invalid_address';
      const mockResponse = {
        status: 400,
        response: {
          status: 400,
          data: 'Invalid address',
        },
      };
      axios.get.mockRejectedValue(mockResponse);

      await act(async () => {
        render(<App />);
      });

      const getAddressInput = screen.getByLabelText('Enter Address');
      const postButton = screen.getByRole('button', { name: 'POST' });
      const getButton = screen.getByRole('button', { name: 'GET' });

      fireEvent.change(getAddressInput, { target: { value: mockAddress } });
      fireEvent.click(getButton);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          `http://localhost:3001/api/entities/${mockAddress}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        expect(toast.error).toHaveBeenCalledWith(
          `Error in GET request: ${mockResponse.response.status}`
        );
      });
    });


    // Test that the data is successfully stored in the database when the handleGetRequest function is called
    it('should store data in the database when handleGetRequest is called', async () => {
      // Mock axios post request
      axios.post = jest.fn().mockResolvedValue({ status: 200, data: { address: "mockAddress" } });

      // Mock axios get request
      axios.get = jest.fn().mockResolvedValue({ data: { address: "mockAddress", risk: "mockRisk" } });

      // Mock axios post insert request
      axios.post.mockImplementationOnce(() => Promise.resolve());

      // Set initial state
      const initialState = {
        responseData: null,
        address: "",
      };
      const setState = jest.fn();
      const useStateSpy = jest.spyOn(React, 'useState');
      useStateSpy.mockImplementation((init) => [init, setState]);

      // Render the component
      render(<App />);

      // Simulate connecting wallet
      fireEvent.click(screen.getByText("Connect Wallet"));

      // Simulate entering address
      fireEvent.change(screen.getByLabelText("Enter Address"), { target: { value: "mockAddress" } });

      // Simulate clicking POST button
      fireEvent.click(screen.getByText("POST"));

      // Wait for POST request to complete
      await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

      // Simulate clicking GET button
      fireEvent.click(screen.getByText("GET"));

      // Wait for GET request to complete
      await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

      // Check if data is stored in the database
      expect(axios.post).toHaveBeenCalledWith("http://localhost:3001/api/insert", {
        address: "mockAddress",
        risk: "mockRisk",
        data: { address: "mockAddress", risk: "mockRisk" },
      });

      // Check if success toast is displayed
      expect(screen.getByText("Data successfully stored in the database")).toBeInTheDocument();
    });


});
