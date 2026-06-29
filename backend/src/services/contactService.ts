import prisma from '../client.ts';

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

export const createContactMessage = async (data: ContactData) => {
  return await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
};
