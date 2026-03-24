import styled from "styled-components";
import { Icon } from '@iconify/react';

const Error = () => {
    return(
        <>
            <FlexColumn>
                <Icon icon="noto:bomb" style={{ fontSize: '70px'} }/>
                <ErrorMsg> Oops! It's a 404! </ErrorMsg>
                <Instructions>Looks like that page doesn't exist. 
                    <Space>
                    Please try refreshing the page or,
                    </Space> 
                    if the problem persists, please:
                    <Space>
                        <Contact href = "mailto: info@btb.ltd">contact support</Contact>
                    </Space> 
                        
                    </Instructions>
            </FlexColumn>
        </>
    )
}

export default Error;

const ErrorMsg = styled.div`
    color: white;
    font-size: 24px;
    font-weight: 900;
    margin: 10px;
    text-align: center;
   
`;
const FlexColumn = styled.div`
    color: white;
  display: flex;
  flex-direction: column;
  height: 400px;
  align-items: center;
  margin-top: 50px;  
 
`;
const Instructions = styled.div`
    font-size: 18px;
    text-align: center;
    margin: 10px;
    a{
        text-decoration: none;
    }
`;
const Space = styled.div`
  margin: 10% 0 1%;
`;
const Contact = styled.a`
    font-size: 18px;
    background-color: white;
    border-radius: 5px;
    padding: 5px;

    color: var(--color-quarternary);

`;