import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  color: #666;

  &:hover {
    color: #000;
  }
`;

const Title = styled.h2`
  margin-top: 0;
  color: #2196F3;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: #1976D2;
  margin-bottom: 10px;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
`;

const ListItem = styled.li`
  margin-bottom: 8px;
  line-height: 1.4;
`;

const Highlight = styled.span`
  background-color: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
`;

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>How to Play Word Chain Reaction</Title>

        <Section>
          <SectionTitle>Game Setup</SectionTitle>
          <List>
            <ListItem>One player creates a room and becomes the host</ListItem>
            <ListItem>Share the room code with other players (2-5 players total)</ListItem>
            <ListItem>Host starts the game when all players have joined</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Basic Rules</SectionTitle>
          <List>
            <ListItem>Players take turns entering words</ListItem>
            <ListItem>Each word must start with the last letter of the previous word</ListItem>
            <ListItem>Words cannot be repeated</ListItem>
            <ListItem>Example: <Highlight>red</Highlight> → <Highlight>drum</Highlight> → <Highlight>murder</Highlight></ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Scoring System</SectionTitle>
          <List>
            <ListItem>Word Length: Points equal to the number of letters in your word</ListItem>
            <ListItem>Chain Length: 2 points for each word in the chain</ListItem>
            <ListItem>Circle Bonus: If you complete a circle (last letter matches first word's first letter), you get bonus points</ListItem>
            <ListItem>Circle Bonus = (chain length + 1) × 2</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Game End Conditions</SectionTitle>
          <List>
            <ListItem>Game ends when:</ListItem>
            <ListItem>• A player completes a circle (minimum 3 words)</ListItem>
            <ListItem>• The chain reaches 10 words</ListItem>
            <ListItem>• A player can't think of a valid word</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>Tips</SectionTitle>
          <List>
            <ListItem>Try to use longer words for more points</ListItem>
            <ListItem>Look for opportunities to create circles</ListItem>
            <ListItem>Pay attention to the last letter of each word</ListItem>
            <ListItem>Keep track of used words to avoid repetition</ListItem>
          </List>
        </Section>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RulesModal; 