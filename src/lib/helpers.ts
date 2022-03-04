import { Combine } from '../interfaces/Helpers';

export const combine: Combine = (obj1, obj2) => {
  return {
    ...(obj1 ? obj1 : {}),
    ...(obj2 ? obj2 : {}),
  };
};
