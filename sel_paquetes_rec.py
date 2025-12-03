def seleccion_paquetes_recursivo(j, W ,pesos, valores):
    if j == 0 or W == 0:
        return 0
    
    if pesos[j -1] > W:
        return seleccion_paquetes_recursivo(j - 1, W, pesos, valores)
    
    #No incluir paquete j
    vsin = seleccion_paquetes_recursivo(j - 1, W, pesos, valores)

    #incluir el paquete j

    vcon= valores[j - 1] + seleccion_paquetes_recursivo(j - 1, W - pesos[j - 1], pesos, valores)

    #Retornar el máxoimo de ambas opciones
    return max(vsin,vcon)


pesos = [2, 3, 4, 5] # pesos de los paquetes
valores = [3, 4, 5, 6] # valores de los paquetes
capacidad = 5
n = len(pesos)

resultado = seleccion_paquetes_recursivo(n, capacidad, pesos, valores)
print("Valor máximo que se puede obtener:", resultado)