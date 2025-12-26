from manim import *
import numpy as np

class Introduce(Scene):
    def construct(self):
        # Scene 1: Neural Network Diagram
        network = VGroup()
        input_layer = VGroup(*[Circle(radius=0.3, color=BLUE) for _ in range(3)]).arrange(DOWN, buff=0.8)
        hidden_layer = VGroup(*[Circle(radius=0.3, color=GREEN) for _ in range(4)]).arrange(DOWN, buff=0.8).next_to(input_layer, RIGHT, buff=2)
        output_layer = VGroup(*[Circle(radius=0.3, color=ORANGE) for _ in range(2)]).arrange(DOWN, buff=0.8).next_to(hidden_layer, RIGHT, buff=2)

        network.add(input_layer, hidden_layer, output_layer)

        # Add connections (lines) - rudimentary example
        connections = VGroup()
        for i_node in input_layer:
            for h_node in hidden_layer:
                connections.add(Line(i_node.get_center(), h_node.get_center(), color=GRAY))
        for h_node in hidden_layer:
            for o_node in output_layer:
                connections.add(Line(h_node.get_center(), o_node.get_center(), color=GRAY))

        network.add(*connections)

        input_label = Text("Input Layer", color=BLUE, font_size=18).next_to(input_layer, UP)
        hidden_label = Text("Hidden Layer", color=GREEN, font_size=18).next_to(hidden_layer, UP)
        output_label = Text("Output Layer", color=ORANGE, font_size=18).next_to(output_layer, UP)
        network.add(input_label, hidden_label, output_label)

        nn_text = Text("Neural Network", font_size=30).move_to(UP*3)
        self.play(FadeIn(network), Write(nn_text), run_time=3)
        self.wait(2)
        self.play(FadeOut(nn_text))
        self.play(FadeOut(network))
        self.wait(1)

        # Scene 2: Forward Pass
        input_value = 0.5
        input_node = input_layer[0].copy().set_color(YELLOW).shift(LEFT*4)
        input_text = Text(str(input_value), font_size=16).move_to(input_node.get_center())
        input_group = VGroup(input_node, input_text)

        first_hidden_node = hidden_layer[0].copy().set_color(YELLOW)
        first_output_node = output_layer[0].copy().set_color(YELLOW).shift(RIGHT*4)

        weight_1 = 0.8
        bias_1 = 0.1
        weight_2 = 0.6
        bias_2 = 0.2

        weight_text_1 = Text(f"w = {weight_1}", font_size=16).move_to(input_node.get_center() + (first_hidden_node.get_center() - input_node.get_center())/2 + DOWN*0.5)
        weight_text_2 = Text(f"w = {weight_2}", font_size=16).move_to(first_hidden_node.get_center() + (first_output_node.get_center() - first_hidden_node.get_center())/2 + DOWN*0.5)

        arrow_1 = Arrow(input_node.get_center(), first_hidden_node.get_center(), buff=0.5, color=YELLOW)
        arrow_2 = Arrow(first_hidden_node.get_center(), first_output_node.get_center(), buff=0.5, color=YELLOW)

        z_eq = Text("z = 0.5 * 0.8 + 0.1 = 0.5", font_size=16)
        a_eq = Text("a = 1 / (1 + e^(-0.5)) = 0.62", font_size=16)

        VGroup(z_eq, a_eq).arrange(DOWN, buff=0.5).move_to(UP*2)

        bias_text_1 = Text(f"bias = {bias_1}", font_size=16).next_to(first_hidden_node, RIGHT)
        bias_text_2 = Text(f"bias = {bias_2}", font_size=16).next_to(first_output_node, RIGHT)

        self.play(FadeIn(input_group))
        self.play(Create(arrow_1), Write(weight_text_1))
        self.play(Transform(input_group.copy(), first_hidden_node), Write(z_eq), Write(a_eq), Write(bias_text_1))

        self.wait(2)

        self.play(Create(arrow_2), Write(weight_text_2))
        self.play(Transform(first_hidden_node.copy(), first_output_node), Write(bias_text_2))

        self.play(FadeOut(z_eq), FadeOut(a_eq))
        self.wait(2)
        self.play(FadeOut(input_group), FadeOut(arrow_1), FadeOut(arrow_2), FadeOut(weight_text_1), FadeOut(weight_text_2), FadeOut(bias_text_1), FadeOut(bias_text_2))
        self.play(FadeOut(first_output_node), FadeOut(first_hidden_node))
        self.wait(1)
        self.clear()

        # Scene 3: Error Calculation
        predicted_value = 0.2
        actual_value = 0.9
        error = actual_value - predicted_value

        prediction_text = Text(f"Prediction: {predicted_value}", color=ORANGE, font_size=20)
        target_text = Text(f"Target: {actual_value}", color=BLUE, font_size=20)
        error_text = Text(f"Error = {actual_value} - {predicted_value} = {error}", color=RED, font_size=20)

        VGroup(prediction_text, target_text, error_text).arrange(DOWN, buff=0.5).move_to(ORIGIN)

        self.play(Write(prediction_text), Write(target_text), Write(error_text))

        error_arrow = Arrow(prediction_text.get_center() + DOWN*0.5, target_text.get_center() + UP*0.5, color=RED)
        self.play(Create(error_arrow))
        self.wait(2)
        self.play(FadeOut(prediction_text), FadeOut(target_text), FadeOut(error_text), FadeOut(error_arrow))
        self.wait(1)

        # Scene 4: Backpropagation
        backprop_text = Text("Backpropagation: Distributing the error.", color=RED, font_size=24).move_to(UP*3)
        self.play(Write(backprop_text))
        back_arrow_1 = DashedArrow(first_output_node.get_center(), first_hidden_node.get_center(), buff=0.5, color=RED)
        back_arrow_2 = DashedArrow(first_hidden_node.get_center(), input_node.get_center(), buff=0.5, color=RED)

        self.play(Create(back_arrow_1))
        self.play(Create(back_arrow_2))
        self.wait(3)
        self.play(FadeOut(backprop_text), FadeOut(back_arrow_1), FadeOut(back_arrow_2))
        self.play(FadeIn(input_node), FadeIn(first_hidden_node), FadeIn(first_output_node))
        self.wait(1)

        # Scene 5: Gradient Descent
        gradient_descent_text = Text("Gradient Descent: Adjusting the weights.", color=GREEN, font_size=24).move_to(UP*3)
        self.play(Write(gradient_descent_text))
        self.wait(2)

        # Simplified gradient descent visualization
        hill = ParametricFunction(lambda t: np.array([t, t**2, 0]), t_range=[-2, 2], color=GREY)
        ball = Dot(point=hill.point_from_function(0), color=BLUE)
        self.play(Create(hill), Create(ball))

        learning_rate = 0.1
        gradient = 0.5  # Simplified gradient

        learning_rate_text = Text(f"learning_rate = {learning_rate}", color=PINK, font_size=16).move_to(RIGHT*3)
        self.play(Write(learning_rate_text))

        arrow_down = Arrow(ball.get_center(), ball.get_center() - RIGHT * gradient * learning_rate, color=RED)
        self.play(Create(arrow_down))

        weight_update_formula = Text("weight = weight - learning_rate * gradient", color=WHITE, font_size=16).move_to(DOWN*2)
        self.play(Write(weight_update_formula))

        new_x = ball.get_center()[0] - learning_rate * gradient
        self.play(ball.animate.move_to(hill.point_from_function(new_x)))
        self.wait(3)
        self.play(FadeOut(gradient_descent_text), FadeOut(hill), FadeOut(ball), FadeOut(arrow_down), FadeOut(learning_rate_text), FadeOut(weight_update_formula))
        self.play(FadeOut(input_node), FadeOut(first_hidden_node), FadeOut(first_output_node))
        self.wait(1)
        self.clear()

        # Scene 6: Weight Update
        weight_update_text = Text("Weight Update", color=GREEN, font_size=24).move_to(UP*3)
        self.play(Write(weight_update_text))

        new_prediction = predicted_value + 0.2  # Improved prediction
        new_prediction_text = Text(f"New Prediction: {new_prediction:.2f}", color=ORANGE, font_size=20).move_to(DOWN*0.5)

        self.play(Write(new_prediction_text))
        self.wait(2)
        self.play(FadeOut(weight_update_text), FadeOut(new_prediction_text))
        self.wait(1)
        self.clear()

        # Scene 7: Epochs
        epochs_text = Text("Epochs: Iterating to minimize error", color=BLUE, font_size=24).move_to(UP*3)
        self.play(Write(epochs_text))

        # Error graph (simplified)
        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 1, 0.2],
            axis_config={"include_numbers": True, "label_constructor": Text}
        )
        axes_labels = axes.get_axis_labels(x_label_tex="Epochs", y_label_tex="Error")
        error_curve = axes.plot(lambda x: np.exp(-x/3), x_range=[0, 9], color=GREEN)
        self.play(Create(axes), Create(error_curve), Write(axes_labels))
        self.wait(3)
        self.play(FadeOut(epochs_text), FadeOut(axes), FadeOut(error_curve), FadeOut(axes_labels))
        self.wait(1)
        self.clear()

        # Scene 8: Key Takeaways
        key_takeaways_text = Text("Key Takeaways: Backpropagation uses the chain rule and gradient descent…", color=WHITE, font_size=20)
        backprop_powerful_text = Text("Backpropagation is a powerful algorithm that enables neural networks…", color=WHITE, font_size=20)

        VGroup(key_takeaways_text, backprop_powerful_text).arrange(DOWN, buff=0.5).move_to(ORIGIN)

        self.play(Write(key_takeaways_text), Write(backprop_powerful_text))
        self.wait(5)
        self.clear()