import { useContext } from 'react';
import styled from 'styled-components';
import { UserContext } from '../../UserContext';

const DestinationTypeAhead = ({ value, onChange, suggestedAddresses }) => {
  const { currentUser } = useContext(UserContext);

  // Default to an empty array if previous_searches is undefined or null
  const previousSearches = (currentUser?.previous_searches || []).filter(search =>
    search.destination.toLowerCase().includes(value.toLowerCase())
  );

  // Default suggestedAddresses to an empty array if undefined or null
  const safeSuggestedAddresses = suggestedAddresses || [];

  const handleSuggestionClick = (address) => {
    onChange({ target: { value: address } });
  };

  return (
    <FlexCol>
      <FlexRow>
        <SearchBar
          type="text"
          value={value}
          onChange={onChange}
        />
        <ClearBtn type="button" onClick={() => onChange({ target: { value: "" } })}>
          Clear
        </ClearBtn>
      </FlexRow>

      {previousSearches.length > 0 && value.length > 0 && (
        <SearchList>
          {previousSearches.map(search => {
            const indexOfMatch = search.destination.toLowerCase().indexOf(value.toLowerCase());
            const firstHalf = search.destination.slice(0, indexOfMatch + value.length);
            const secondHalf = search.destination.slice(indexOfMatch + value.length);
            return (
              <SearchListItem key={search.destination} onClick={() => handleSuggestionClick(search.destination)}>
                {firstHalf}<Prediction>{secondHalf}</Prediction>
              </SearchListItem>
            );
          })}
        </SearchList>
      )}

      {safeSuggestedAddresses.length > 0 && (
        <SuggestionsList>
          {safeSuggestedAddresses.map(address => (
            <li key={address} onClick={() => handleSuggestionClick(address)}>
              {address}
            </li>
          ))}
        </SuggestionsList>
      )}
    </FlexCol>
  );
};

export default DestinationTypeAhead;

const SearchBar = styled.input`
  font-size: 1em;
  width: 100%;
  height: 2rem;
  border: none;
  padding: 0 0.3rem 0 0.5rem;
  &:focus-visible {
    outline: 2px solid var(--color-secondary);
  }
`;

const ClearBtn = styled.button`
  color: var(--color-secondary);
  background-color: white;
  border-top: none;
  border-bottom: none;
  border-right: none;
  border-left: 0.1rem solid var(--color-secondary);
  font-size: 1em;
  height: 2rem;
  padding: 0.3rem 0.5rem;
  transition: ease-in-out 100ms;
`;

const SearchList = styled.ul`
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  padding: 10px;
  width: 100%;
  background-color: white;
`;

const SearchListItem = styled.li`
  padding: 5px;
  font-size: 14px;
  &:hover {
    background-color: whitesmoke;
  }
`;

const Prediction = styled.span`
  font-weight: bold;
`;

const SuggestionsList = styled.ul`
  padding: 10px;
  width: 100%;
  background-color: white;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
  font-size: 14px;
`;

const FlexRow = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
