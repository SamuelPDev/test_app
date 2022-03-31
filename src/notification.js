import { alert as notify } from "notie";

/*
({
  type: 3, // optional, default = 4, enum: [1, 2, 3, 4, 5, 'success', 'warning', 'error', 'info', 'neutral']
  text: "Deben coincidir las contraseñas",
  stay: false, // optional, default = false
  time: 3, // optional, default = 3, minimum = 1,
  position: "top", // optional, default = 'top', enum: ['top', 'bottom']
})
*/

export function Success({ message, time }) {
  return notify({
    type: 1,
    text: message,
    stay: false,
    time,
    position: "top",
  });
}

export function ErrorAlert({ message, time }) {
  return notify({
    type: 3,
    text: message,
    stay: false,
    time,
    position: "top",
  });
}

export function Warning({ message, time }) {
  return notify({
    type: 2,
    text: message,
    stay: false,
    time,
    position: "top",
  });
}

export function Info({ message, time }) {
  return notify({
    type: 4,
    text: message,
    stay: false,
    time,
    position: "top",
  });
}
