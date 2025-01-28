# LuckyLoop 🚀🥇
Hecho por Omar Daza, Alejandro Cernada y Dario Collar. 💸

## Primer Diagrama

![Diagrama del Proyecto](https://github.com/oda-tfg/LuckyLoop/blob/main/LuckyLoop/Diagramas/PrimerDiagrama.png)


## Instalación del proyecto
```
git clone https://github.com/oda-tfg/LuckyLoop.git
```

## Actualización si ya tienes el proyecto
```
git pull origin main
```

## Guardar cambios en la base de datos
1. Si los haces tu:
```
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

2. Si no las haces tu:
```
php bin/console doctrine:migrations:migrate
```
