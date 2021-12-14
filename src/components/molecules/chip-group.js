import React from 'react';

import { Chip } from '_atoms';

const SelectSingle = ({ selected, onChange, labels }) => {
  if (new Set(labels).size !== labels.length) {
    throw new SyntaxError('labels contains duplicate strings');
  }

  return (
    <>
      {labels.map((label) => {
        const isSelected = selected === label;
        return (
          <Chip.Choice
            key={label}
            checkmark={false}
            selected={isSelected}
            onPress={() => onChange(label)}>
            {label}
          </Chip.Choice>
        );
      })}
    </>
  );
};

const SelectMultiple = ({ selected, onChange, labels }) => {
  if (new Set(labels).size !== labels.length) {
    throw new SyntaxError('labels contains duplicate strings');
  }

  return (
    <>
      {labels.map((label) => (
        <Chip.Choice
          key={label}
          checkmark={true}
          selected={selected.includes(label)}
          onPress={() => {
            onChange(label);
          }}>
          {label}
        </Chip.Choice>
      ))}
    </>
  );
};

const ChipGroup = { SelectSingle, SelectMultiple };

export default ChipGroup;
