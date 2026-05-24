import styled from 'styled-components';
import { useState } from 'react';

interface TypeaheadProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  suggestedOriginAddresses: string[];
  suggestedDestinationAddresses: string[];
}

const Typeahead = ({ value, onChange, suggestedOriginAddresses, suggestedDestinationAddresses }: TypeaheadProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSuggestionClick = (address: string) => {
    console.log("Suggestion clicked:", address);
    onChange({ target: { value: address } });
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setShowSuggestions(true);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allSuggestions = [...suggestedOriginAddresses, ...suggestedDestinationAddresses];
    if (e.key === "ArrowDown") {
      setSelectedSuggestion((prevIndex) => Math.min(prevIndex + 1, allSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedSuggestion((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter" && selectedSuggestion >= 0) {
      handleSuggestionClick(allSuggestions[selectedSuggestion]);
    }
  };

  return (
    <FlexCol>
      <FlexRow>
        <SearchBar
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={""}
          onKeyDown={handleKeyDown}
        />
        <ClearBtn type="button" onClick={() => onChange({ target: { value: "" } })}>
          Clear
        </ClearBtn>
      </FlexRow>

      {showSuggestions && Array.isArray(suggestedOriginAddresses) && suggestedOriginAddresses.length > 0 && value.length > 0 && (
        <SearchList>
          {suggestedOriginAddresses.map(search => {
            const indexOfMatch = search.toLowerCase().indexOf(value.toLowerCase());
            const firstHalf = search.slice(0, indexOfMatch + value.length);
            const secondHalf = search.slice(indexOfMatch + value.length);
            return (
              <SearchListItem key={search} onClick={() => handleSuggestionClick(search)}>
                {firstHalf}<Prediction>{secondHalf}</Prediction>
              </SearchListItem>
            );
          })}
        </SearchList>
      )}
      {showSuggestions && Array.isArray(suggestedDestinationAddresses) && suggestedDestinationAddresses.length > 0 && value.length > 0 && (
        <SearchList>
          {suggestedDestinationAddresses.map(search => {
            const indexOfMatch = search.toLowerCase().indexOf(value.toLowerCase());
            const firstHalf = search.slice(0, indexOfMatch + value.length);
            const secondHalf = search.slice(indexOfMatch + value.length);
            return (
              <SearchListItem key={search} onClick={() => handleSuggestionClick(search)}>
                {firstHalf}<Prediction>{secondHalf}</Prediction>
              </SearchListItem>
            );
          })}
        </SearchList>
      )}
    </FlexCol>
  );
};

export default Typeahead;

const SearchBar = styled.input`
  font-size: 1em;
  width: 100%;
  height: 2rem;
  border: none;
  padding: 0 0.3rem 0 0.5rem;
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
  font-size: 14px;
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